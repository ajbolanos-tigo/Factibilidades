const AWS = require('aws-sdk');
const axios = require('axios');
const exceljs = require('exceljs');
const querystring = require('querystring');
const dynamoDB = new AWS.DynamoDB.DocumentClient();


const s3 = new AWS.S3();
const dataEndpoint = 'https://apps-proactive-ext.tigo.com.gt/feasibility/getFeasibilities';

exports.handler = async (event, context) => {
    try {
        const bucket = event.Records[0].s3.bucket.name;
        const key = event.Records[0].s3.object.key;
        await processS3File(bucket, key);
    } catch (error) {
        console.error('Error en el manejador principal:', error.message);
    }
};

async function processS3File(bucket, key) {
    try {
        // Verifica si el nombre del archivo contiene la palabra "update"
        if (key.toLowerCase().includes('update')) {
            console.log(`El archivo ${key} contiene la palabra "update". No se procesará.`);
            return;
        }

        const accessToken = await getAccessToken();
        const excelFilePath = `s3://${bucket}/${key}`;
        await processExcelFile(excelFilePath, accessToken, key);
    } catch (error) {
        console.error('Error en el procesamiento del archivo S3:', error.message);
    }
}

async function getAccessToken() {
    try {
        const authCredentials = { username: 'base_portal', password: 'ra1uPb6jv1/OgmjZbtjCl6txy' };
        const bodyCredentials = { grant_type: 'password', username: 'user@integrator.com', password: 'IjA8vWPGQxQX' };
        const tokenEndpoint = 'https://apps-proactive-ext.tigo.com.gt/auth-server/oauth/token';
        const responseToken = await axios.post(tokenEndpoint, querystring.stringify(bodyCredentials), {
            auth: authCredentials,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const accessToken = responseToken.data.access_token;
        return accessToken;
    } catch (error) {
        console.error('Error al obtener el token de autenticación:', error.message);
        throw error;
    }
}

async function processExcelFile(filePath, accessToken,key) {
    try {
        const params = {
            Bucket: filePath.split('/')[2],
            Key: key,
        };
        const readStream = s3.getObject(params).createReadStream();
        const workbook = new exceljs.Workbook();
        await workbook.xlsx.read(readStream);
        const worksheet = workbook.getWorksheet(1);
        // Definir la cantidad máxima de solicitudes concurrentes
        const batchSize = 3;
        
        for (let startRow = 3; startRow <= worksheet.actualRowCount; startRow += batchSize) {
            const batchRequests = [];
            for (let i = 0; i < batchSize && (startRow + i) <= worksheet.actualRowCount; i++) {
                const row = startRow + i;
                const isRowEmpty = worksheet.getCell(`D${row}`).value === null && worksheet.getCell(`B${row}`).value === null;

                if (isRowEmpty) {
                    break;
                }

                const x = worksheet.getCell(`D${row}`).value;
                const y = worksheet.getCell(`E${row}`).value;
                //const productoCell = worksheet.getCell(`C${row}`);
                const producto = '873';
                const building = worksheet.getCell(`G${row}`).value.toString();

        
                console.log(`Añadiendo solicitud para x=${x}, y=${y}, producto=${producto}`);
                batchRequests.push(executeRequestWithParameters(dataEndpoint, accessToken, x, y, producto,worksheet,row,building));
            }
            if (batchRequests.length === 0) {
            break;
            }
            
            // Ejecutar el lote de solicitudes y esperar a que se completen
            await Promise.all(batchRequests);

        }
        
        const updatedFilePath = `s3://${filePath.split('/')[2]}/${key.split('/').pop().split('.')[0]}_updated.xlsx`;
        await s3.upload({
            Bucket: filePath.split('/')[2],
            Key: `public/${key.split('/').pop().split('.')[0]}_updated.xlsx`,
            Body: await workbook.xlsx.writeBuffer(),
        }).promise();

        console.log('Archivo modificado guardado en S3:', updatedFilePath);

    } catch (error) {
        console.error('Error en el procesamiento del archivo Excel:', error.message);
    }
}
async function executeRequestWithParameters(endpoint, token, x, y, producto, worksheet, row,building) {
    try {
        const requestData = {
            productId: producto,
            coordinates: { lat: x, lon: y },
            speedValue: '12',
            speedUnits: 'MB',
            productName: 'N/A',
            cxmCode: null,
            cxmMessage: null,
            ipranSize: 200,
            ipranPage: 0,
            nElementIpran: 0,
        };
        const response = await axios.post(endpoint, requestData, {
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });

        if (response.data && response.data.factibilidades && response.data.factibilidades.length > 0) {
            const factibilidad = response.data.factibilidades[0];

            // Check if 'poligonos' is an empty array
            const isNotFeasible = !factibilidad.poligonos || factibilidad.poligonos.length === 0;
            if (isNotFeasible) {
                console.log(`No es factible para x=${x}, y=${y}, producto=${producto}`);
                worksheet.getCell(`H${row}`).value = '----FACTIBILIDAD REMOTO GPON---- NO APROBADO';
            } else {
                console.log(`Es factible para x=${x}, y=${y}, producto=${producto}`);
                const primerPoligono = factibilidad.poligonos[0];
                
                // Llamar a la función para encontrar la mejor conexión
                const mejorConexion = await obtenerMejorConexion(primerPoligono.conexiones,building);

                if (mejorConexion) {
                    imprimirMejorConexionEnExcel(mejorConexion,x,y,worksheet,row,building);
                } else {
                    console.log(`No hay conexiones viables para el primer polígono.`);
                    worksheet.getCell(`H${row}`).value = '----FACTIBILIDAD REMOTO GPON---- NO APROBADO';
                }
            }
        } else {
            console.log(`No se encontró la propiedad 'factibilidades' en la respuesta.`);
        }

    } catch (error) {
        console.error(`Error en la solicitud para x=${x}, y=${y}, producto=${producto}:`, error.message);
        throw error;
    }
}


// Función para obtener la mejor conexión
async function obtenerMejorConexion(conexiones,building) {
    try {
        const Building = building;
        let conexionesEncontradas = [];
        if (!conexiones || !Array.isArray(conexiones) || conexiones.length === 0) {
            console.log('No hay conexiones disponibles o el formato es incorrecto:', conexiones);
            return null;
        }
        const resultados = await buscarCodigosEnDynamoDB(conexiones);
        //Filtrar conexiones si pertenecen a un edificio o no
        if (Building && Building.toLowerCase() === 'no') {
            conexionesEncontradas = conexiones.filter((conexion) => {
                const codigoConexion = conexion.codigo;
                const resultadoEncontrado = resultados.find((resultado) => resultado.codigo === codigoConexion && resultado.encontrado && (resultado.Edificio == null || resultado.Edificio.trim() === ''));
                return resultadoEncontrado;
            });

        }
        if (Building && Building.toLowerCase() === 'yes') {
            conexionesEncontradas = conexiones.filter((conexion) => {
                const codigoConexion = conexion.codigo;
                const resultadoEncontrado = resultados.find((resultado) => {
                    return resultado.codigo === codigoConexion && resultado.encontrado && (resultado.Edificio !== null && resultado.Edificio.trim() !== '');
                });
                return resultadoEncontrado;
            });
        }
        // Filtrar conexiones que cumplen con el criterio de ocupación inferior al 80%
        const conexionesFiltradas = conexionesEncontradas.filter(
            conexion => {
                if (!conexion.ocupacionCapa2) {
                    console.log('OcupaciónCapa2 no definida para una conexión:', conexion);
                    return false;
                }

                const ocupacion = parseFloat(conexion.ocupacionCapa2);
                if (isNaN(ocupacion)) {
                    console.log('OcupaciónCapa2 no es un número válido para una conexión:', conexion);
                    return false;
                }

                return ocupacion < 80;
            }
        );
        if (conexionesFiltradas.length === 0) {
            console.log('No hay conexiones que cumplan el criterio de ocupación inferior al 80%. Conexiones originales:', conexiones);
            return null; // O manejar el caso cuando no hay conexiones que cumplan el criterio
        }

        // Ordenar conexiones por distancia ascendente
        const conexionesOrdenadas = conexionesFiltradas.sort(
            (a, b) => parseFloat(a.distanciaMetraje) - parseFloat(b.distanciaMetraje)
        );

        // Devolver la primera conexión (la de menor distancia)
        return conexionesOrdenadas[0];
    } catch (error) {
        console.error('Error en obtenerMejorConexion:', error.message);
        throw error;
    }
}

async function buscarCodigosEnDynamoDB(conexiones) {
    const consultasDynamoDB = conexiones.map(async (conexion) => {
        const codigo = conexion.codigo;
        const params = {
            TableName: 'DataMufas_DB',
            Key: {
                Codigo: codigo,
            },
        };
        try {
            const data = await dynamoDB.get(params).promise();
            if (data.Item) {
                const Edificio = data.Item.Edificio;
                return { codigo, encontrado: true,  Edificio};
            } else {
                return { codigo, encontrado: false };
            }
        } catch (error) {
            console.error(`Error al buscar el código ${codigo} en DynamoDB:`, error);
            return { codigo, encontrado: false, error };
        }
    });

    const resultados = await Promise.all(consultasDynamoDB);
    return resultados;
}

function imprimirMejorConexionEnExcel(mejorConexion, x, y, worksheet, row,building) {
    worksheet.getCell(`H${row}`).value = '----FACTIBILIDAD REMOTO GPON---- APROBADO';
    let distanciaMetraje;
    if (building && building.toLowerCase() === 'yes') {
        distanciaMetraje = 300;
    } else if (building && building.toLowerCase() === 'no') {
        // Calcular el 10% adicional para distanciametraje
        distanciaMetraje = mejorConexion.distanciaMetraje + (mejorConexion.distanciaMetraje * 0.1);
    } else {
        // Manejar otros casos si es necesario
        // Puedes dejarlo sin cambios o asignar un valor por defecto
        distanciaMetraje = mejorConexion.distanciaMetraje;
    }
    const informacion = `MUFA PROPUESTA: ${mejorConexion.codigo}\nNOMBRE: ${mejorConexion.nombre}\nOLT: ${mejorConexion.olt}\nFRAME: ${mejorConexion.frame} SLOT: ${mejorConexion.slot} PORT: ${mejorConexion.port}\nREMANENTE: ${mejorConexion.leftbw} \nEstudio realizado con las coordenadas: lat:${x}, lon:${y}`;

    worksheet.getCell(`I${row}`).value = informacion;
    worksheet.getCell(`J${row}`).value = distanciaMetraje;
}