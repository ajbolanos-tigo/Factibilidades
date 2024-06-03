import React, { useState } from 'react';
import { Amplify } from 'aws-amplify';
import { Authenticator, Button, Flex } from '@aws-amplify/ui-react';
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

import config from './amplifyconfiguration.json';
// import awsExports from './aws-exports'
Amplify.configure(config);

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

  const uploadDataInBrowser = async (event) => {
    if (event?.target?.files) {
      const file = event.target.files[0];
      const filename = file.name;
      try {
        setLoading(true); // Mostrar el loader al iniciar la carga

        await uploadData({
          key: filename,
          data: file,
        });

        console.log('File uploaded successfully');
        const updatedFilename = `${filename.split('.')[0]}_updated.xlsx`;

        while (!(await doesFileExist(updatedFilename))) {
          await sleep(10000);
        }

        console.log('File updated successfully');

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
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false); // Ocultar el loader al finalizar la carga
      }
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const downloadFormat = async (event) => {
    const getUrlResult = await getUrl({
      key: 'formato_proyectbi.xlsx',
      options: {
        accessLevel: 'guest',
        validateObjectExistence: false,
        expiresIn: 60,
      },
    });

    window.location.href = getUrlResult.url.toString();
  };

  return (
    <Authenticator hideSignUp>
      {({ signOut, user }) => (
        // <LoaderFactis/>
        <div className={`container ${loading ? 'loading' : ''}`}>
          <Image
            alt="Amplify logo"
            src="src/Logo_Tigo.svg"
            objectFit="initial"
            objectPosition="50% 50%"
            backgroundColor="initial"
            width="75px"
            height="54px"
            opacity="100%"
            onClick={() => alert('📸 Say cheese!')}
          />
          <h2>Sistema de Estimación de Factibilides</h2>
          <div style={appStyles.flexContanier}>
            <Flex direction="column" style={appStyles.flex}>
              <Button onClick={downloadFormat} className="button">
                Descargar Formato Excel
              </Button>
              <label className="file-input-label">
                Subir Archivo
                <input type="file" onChange={(event) => uploadDataInBrowser(event)} />
              </label>
              <Button className="button">
                Factibilidades unitarias
              </Button>
              <Button onClick={signOut} className="button">
                Sign Out
              </Button>
            </Flex>
          </div>
          {/* <div className="myElementWithBackground">Contenido del componente</div> */}
        </div>
      )}
    </Authenticator>
  );
};

export default App;
