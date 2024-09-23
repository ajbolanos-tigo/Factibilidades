import React, { useEffect, useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Alert, Authenticator, Button, Flex } from '@aws-amplify/ui-react';
import { Loader, Image } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { uploadData, getUrl, list } from 'aws-amplify/storage';

//Estilos
import './styles2.css';
import { appStyles } from './styles';

//Formulario factis unitaria 
import FactiUnitaria from './assets/Forms/FormularioFactisU';

//Loader factis
import LoaderFactis from './assets/Loader/Loader';

//APIs
import { get } from 'aws-amplify/api';

import config from './amplifyconfiguration.json';
import DataForm from './assets/DataForm/DataForm';

import dump_data from './assets/DUMP_DATA/response_data.json'
import AlertComponent from './assets/Alerts/AlertComponent';

//Logo
import Logo from './Logo_Tigo.svg'

// import awsExports from './aws-exports'
Amplify.configure(config);

const VALID_FILE_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel"
]

const doesFileExist = async (filename) => {
  try {
    const result = await list({
      prefix: filename,
    });
    return result.items.length > 0;
  } catch (error) {
    return false;
  }
};

const App = ({ signOut, user }) => {
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFormActive, setIsFormActive] = useState(false);
  const [isDataFormActive, setIsDataFormActive] = useState(false);
  const [dataForm, setDataForm] = useState({})

  //Alertas
  const [alerts, setAlerts] = useState([])

  const activateForm = () => setIsFormActive(true);
  const deactivateForm = () => setIsFormActive(false);

  const activateDataForm = () => setIsDataFormActive(true);
  const deactivateDataForm = () => setIsDataFormActive(false);

  const addAlert = (text, variation) => {
    const newAlert = { id: Date.now(), text, dismissed: false, variation }
    setAlerts([...alerts, newAlert])

    // Se quitaran despues de 5 segundos
    setTimeout(() => {
      dismissAlert(newAlert.id)
    }, 5000)
  }

  const dismissAlert = (id) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === id ? { ...alert, dismissed: true } : alert
      )
    )

    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id))
    }, 800);
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      deactivateForm();
    }
  };

  const handleDataForm = obj => {
    setDataForm({ ...obj })
    activateDataForm()
    console.log(obj)
  }

  const verifyFileName = (file) => {
    const { name: filename, type: fileType } = file

    if (file && !VALID_FILE_TYPES.includes(fileType)) {
      addAlert("Archivo no válido. Suba un archivo Excel", "error")
      return false
    }
    if (filename.indexOf(' ') >= 0) {
      addAlert("El archivo tiene espacios en el nombre", "error")
      return false
    }
    if (filename.toLowerCase().includes('update')) {
      addAlert("El archivo contiene update en el nombre", "error")
      return false
    }

    if (filename.toLowerCase() === 'formato_proyectbi.xlsx') {
      addAlert("El archivo no puede llamarse 'formato_proyectbi.xlsx'", "error")
      return false
    }
    return true
  }

  const uploadDataInBrowser = async (event) => {
    if (event?.target?.files) {
      const file = event.target.files[0];
      if (!verifyFileName(file)) return

      try {
        setLoading(true); // Mostrar el loader al iniciar la carga
        const filename = file.name

        await uploadData({
          key: filename,
          data: file,
        });

        console.log('Flile uploaded successfully');
        const updatedFilename = `${filename.split('.')[0]}_updated.xlsx`;

        const maxTimeout = 15 * 60 * 1000
        const checkInterval = 10000
        let elapsedTime = 0

        const checkFile = setInterval(async () => {
          try {
            elapsedTime += checkInterval
            if (elapsedTime >= maxTimeout) {
              clearInterval(checkFile)
              addAlert("Timeout de proceso de la factibilidad", "error");
              setLoading(false)
              return
            }

            if (await doesFileExist(updatedFilename)) {
              clearInterval(checkFile)
              console.log('File update successfully')

              const getUrlResult = await getUrl({
                key: updatedFilename,
                options: {
                  accessLevel: 'guest',
                  validateObjectExistence: false,
                  expiresIn: 20,
                },
              });

              window.location.href = getUrlResult.url.toString();
              console.log(getUrlResult.url.toString());
              addAlert("Factis realizada con exito", "success")
              setLoading(false)

            }
          } catch (error) {
            clearInterval(checkFile);
            console.error('Error during file check:', error);
            addAlert("Error al procesar el archivo", "error");
            setLoading(false);
          }
        }, checkInterval)
      } catch (error) {
        console.error('Error:', error);
        addAlert("Error al subir el archivo", "error");
        setLoading(false)
      }
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const downloadFormat = async (event) => {
    const getUrlResult = await getUrl({
      path: 'protected/formato_proyectbi.xlsx',

      options: {
        validateObjectExistence: true,
        expiresIn: 60,
      }
    })

    window.location.href = getUrlResult.url.toString();
  };

  return (
    <Authenticator hideSignUp>
      {({ signOut, user }) => (
        <>
          <div className={`container ${loading ? 'loading' : ''} ${isFormActive ? 'blur' : ''}`}>
            {loading && (
              <LoaderFactis />
            )}
            <Image
              alt="Tigo logo"
              src={Logo}
              objectFit="initial"
              objectPosition="50% 50%"
              backgroundColor="initial"
              width="75px"
              height="54px"
              opacity="100%"
            />
            <h2>Sistema de Estimación de Factibilides</h2>
            <div style={appStyles.flexContanier}>
              <Flex direction="column" style={appStyles.flex}>
                <Button onClick={downloadFormat} className="button">
                  Descargar Formato Excel
                </Button>
                <label className="file-input-label">
                  Subir Archivo
                  <input type="file" accept=".xlsx, .xls" onChange={(event) => uploadDataInBrowser(event)} />
                </label>
                <Button className="button" onClick={activateForm}>
                  Factibilidades unitarias
                </Button>
                <Button onClick={signOut} className="button">
                  Sign Out
                </Button>
              </Flex>
            </div>
            {/* <div className="myElementWithBackground">Contenido del componente</div> */}
          </div>
          {isFormActive && (
            <div className="form-overlay" onClick={handleOverlayClick}>
              <FactiUnitaria handleDataForm={handleDataForm} onClose={deactivateForm} user={user} addAlert={addAlert} />
            </div>
          )}
          {isDataFormActive && (
            <div>
              <DataForm data={dataForm} onClose={deactivateDataForm} addAlert={addAlert} />
            </div>
          )}
          <AlertComponent alerts={alerts} onDismiss={dismissAlert} />
        </>
      )}
    </Authenticator>
  );
};

export default App;
