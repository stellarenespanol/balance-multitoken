import React from "react";
import { createPortal } from "react-dom";
import {
  Card,
  Layout,
  Notification,
  Profile,
  Heading,
  Button,
} from "@stellar/design-system";
import {
  StellarWalletsKit,
  WalletNetwork,
  WalletType,
  ISupportedWallet,
} from "stellar-wallets-kit";

import { TESTNET_DETAILS } from "../../helpers/network";
import { ERRORS } from "../../helpers/error";

import { ConnectWallet } from "./connect-wallet";
import { WalletBalance } from "./wallet-balance";

import "./index.scss";

/**
 * Props para el componente principal de la aplicación
 * @property {boolean} hasHeader - Indica si se debe mostrar el encabezado
 */
interface BalanceCheckerProps {
  hasHeader?: boolean;
}

/**
 * Componente principal de la aplicación Stellar Balance Checker
 * Maneja la conexión de wallet y la visualización del saldo
 * 
 * @param {BalanceCheckerProps} props - Propiedades del componente
 * @returns {JSX.Element} - Elemento JSX renderizado
 */
export const BalanceChecker = (props: BalanceCheckerProps) => {
  // Determina si se debe mostrar el encabezado, por defecto es true
  const hasHeader = props.hasHeader === undefined ? true : props.hasHeader;

  // Configuración de la red, por defecto usamos Testnet
  const [selectedNetwork] = React.useState(TESTNET_DETAILS);

  // Estado para almacenar la clave pública de la wallet conectada
  const [activePubKey, setActivePubKey] = React.useState(null as string | null);
  
  // Estado para manejar errores de conexión
  const [connectionError, setConnectionError] = React.useState(
    null as string | null,
  );
  
  // Estado para controlar si la wallet está conectada
  const [isWalletConnected, setIsWalletConnected] = React.useState(false);

  // Inicialización del kit de wallets de Stellar
  const [SWKKit] = React.useState(
    new StellarWalletsKit({
      network: selectedNetwork.networkPassphrase as WalletNetwork,
      selectedWallet: WalletType.FREIGHTER,
    }),
  );

  // Actualiza la red en el kit de wallets cuando cambia la red seleccionada
  React.useEffect(() => {
    SWKKit.setNetwork(selectedNetwork.networkPassphrase as WalletNetwork);
  }, [selectedNetwork.networkPassphrase, SWKKit]);

  /**
   * Función para conectar la wallet
   * Abre un modal que permite al usuario seleccionar y conectar su wallet
   * 
   * @returns {Promise<void>} Promesa que se resuelve cuando se completa el proceso de conexión
   */
  const connectWallet = async () => {
    // Limpia cualquier error previo
    setConnectionError(null);

    if (!activePubKey) {
      // Abre el modal de selección de wallet
      await SWKKit.openModal({
        // Lista de wallets permitidas
        allowedWallets: [
          WalletType.ALBEDO,
          WalletType.FREIGHTER,
          WalletType.XBULL,
        ],
        // Callback cuando se selecciona una wallet
        onWalletSelected: async (option: ISupportedWallet) => {
          try {
            // Establece la wallet seleccionada
            SWKKit.setWallet(option.type);
            // Obtiene la clave pública
            const publicKey = await SWKKit.getPublicKey();

            // Establece la red a Testnet
            await SWKKit.setNetwork(WalletNetwork.TESTNET);
            // Actualiza los estados con la clave pública y marca la wallet como conectada
            setActivePubKey(publicKey);
            setIsWalletConnected(true);
          } catch (error) {
            // Maneja errores de conexión
            console.log(error);
            setConnectionError(ERRORS.WALLET_CONNECTION_REJECTED);
          }
        },
      });
    }
  };

  /**
   * Función para desconectar la wallet
   * Restablece los estados relacionados con la wallet
   * 
   * @returns {void} No retorna ningún valor
   */
  const disconnectWallet = () => {
    // Limpia la clave pública
    setActivePubKey(null);
    // Marca la wallet como desconectada
    setIsWalletConnected(false);
    // Limpia cualquier error
    setConnectionError(null);
  };

  return (
    <>
      {/* Muestra el encabezado si hasHeader es true */}
      {hasHeader && (
        <Layout.Header hasThemeSwitch projectId="stellar-balance-checker" />
      )}
      
      {/* Muestra la insignia de la cuenta si hay una wallet conectada */}
      <div className="Layout__inset account-badge-row">
        {activePubKey !== null && (
          <div className="account-actions">
            {/* Muestra la dirección de la wallet */}
            <Profile isShort publicAddress={activePubKey} size="sm" />
            
            {/* Botón para desconectar la wallet */}
            <Button
              size="sm"
              variant="destructive"
              onClick={disconnectWallet}
              className="disconnect-button"
            >
              Desconectar
            </Button>
          </div>
        )}
      </div>
      
      {/* Contenido principal de la aplicación */}
      <div className="Layout__inset layout">
        <div className="balance-container-main">
          <Card variant="primary">
            {!isWalletConnected ? (
              // Si no hay wallet conectada, muestra el componente de conexión
              <>
                {/* <Heading as="h1" size="sm">
                  Balance Wallet
                </Heading> */}
                <ConnectWallet
                  selectedNetwork={selectedNetwork.network}
                  pubKey={activePubKey}
                  onClick={connectWallet}
                />
              </>
            ) : (
              // Si hay wallet conectada, muestra el componente de saldo
              <>
                <Heading as="h1" size="sm">
                  Información de tu Cuenta
                </Heading>
                <WalletBalance activeAccount={activePubKey} />
              </>
            )}
          </Card>
        </div>
        
        {/* Sección de bienvenida con información sobre la aplicación */}
        <div className="welcome-section">
          <Card variant="secondary">
            <Heading as="h2" size="md">
              Bienvenido a Stellar Balance
            </Heading>
            <p className="description-text">
              Esta aplicación te permite consultar de forma rápida y sencilla los saldos de tu cuenta en la red Stellar.
              Conecta tu wallet y visualiza al instante cuántos XLM y USDC tienes disponibles en tu cuenta en la red de pruebas (testnet).
            </p>
          </Card>
        </div>
        
        {/* Muestra notificaciones de error si existen */}
        {connectionError !== null &&
          createPortal(
            <div className="notification-container">
              <Notification title={connectionError!} variant="error" />
            </div>,
            document.getElementById("root")!,
          )}
      </div>
    </>
  );
};
