import React from "react";
import { Button, Heading, Select } from "@stellar/design-system";

/**
 * Props para el componente ConnectWallet
 * @property {string} selectedNetwork - Red seleccionada (Testnet)
 * @property {string | null} pubKey - Clave pública de la wallet conectada
 * @property {Function} onClick - Función a ejecutar al hacer clic en el botón
 */
interface ConnectWalletProps {
  selectedNetwork: string;
  pubKey: string | null;
  onClick: () => void;
}

/**
 * Componente que muestra la interfaz para conectar la wallet
 * Permite al usuario conectar su wallet Stellar para consultar su saldo
 * 
 * @param {ConnectWalletProps} props - Propiedades del componente
 * @returns {JSX.Element} - Elemento JSX renderizado
 */
export const ConnectWallet = (props: ConnectWalletProps) => {
  // Texto del botón según si hay una wallet conectada o no
  const text = props.pubKey ? "Ver Saldo" : "Conectar Wallet";
  
  return (
    <>
      {/* Título del componente */}
      <Heading as="h1" size="sm">
        Balance Wallet
      </Heading>
      
      {/* Selector de red (deshabilitado, solo muestra Testnet) */}
      <Select
        disabled
        fieldSize="md"
        id="selected-network"
        label="Selecciona tu Red"
        value={props.selectedNetwork}
      >
        <option>{props.selectedNetwork}</option>
      </Select>
      
      {/* Botón para conectar la wallet o ver el saldo */}
      <div className="submit-row">
        <Button
          size="md"
          variant="tertiary"
          isFullWidth
          onClick={props.onClick}
        >
          {text}
        </Button>
      </div>
    </>
  );
};
