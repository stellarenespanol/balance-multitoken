import React, { useEffect, useState } from "react";
import { Card, Heading, Loader } from "@stellar/design-system";
import "./index.scss";

/**
 * Props para el componente WalletBalance
 * @property {string | null} activeAccount - Dirección pública de la cuenta activa
 */
interface WalletBalanceProps {
  activeAccount: string | null;
}

/**
 * Interfaz para representar un balance de token
 */
interface TokenBalance {
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  balance: string;
}

/**
 * Formatea un número para mostrarlo en la interfaz
 * Si el número es grande, lo acorta y añade sufijos (K, M)
 * 
 * @param {string | null} balance - El balance a formatear
 * @returns {string} - El balance formateado
 */
const formatBalanceForDisplay = (balance: string | null): string => {
  if (!balance) return "0";
  
  const num = parseFloat(balance);
  
  // Si el número es menor que 1000, mostramos hasta 2 decimales
  if (num < 1000) {
    return num.toFixed(2);
  }
  
  // Si el número es mayor o igual a 1000 pero menor que 1,000,000, lo formateamos con K
  if (num < 1000000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  // Si el número es mayor o igual a 1,000,000, lo formateamos con M
  return `${(num / 1000000).toFixed(1)}M`;
};

/**
 * Determina la clase CSS para el tamaño de fuente según la longitud del balance formateado
 * 
 * @param {string} formattedBalance - El balance ya formateado
 * @returns {string} - La clase CSS para el tamaño de fuente
 */
const getBalanceFontSizeClass = (formattedBalance: string): string => {
  const length = formattedBalance.length;
  
  if (length <= 4) return ""; // Tamaño normal
  if (length <= 6) return "balance-amount-medium";
  return "balance-amount-small";
};

/**
 * Componente que muestra el saldo de XLM y USDC de una cuenta Stellar
 * Realiza una consulta a la API de Horizon para obtener los saldos
 * 
 * @param {WalletBalanceProps} props - Propiedades del componente
 * @returns {JSX.Element | null} - Elemento JSX renderizado o null si no hay cuenta activa
 */
export const WalletBalance = ({ activeAccount }: WalletBalanceProps) => {
  // Estado para almacenar el saldo de XLM
  const [xlmBalance, setXlmBalance] = useState<string | null>(null);
  // Estado para almacenar el saldo de USDC
  const [usdcBalance, setUsdcBalance] = useState<string | null>("0");
  // Estado para controlar la carga de datos
  const [isLoading, setIsLoading] = useState(false);
  // Estado para manejar errores
  const [error, setError] = useState<string | null>(null);

  // Efecto para obtener el saldo cuando se conecta una cuenta
  useEffect(() => {
    /**
     * Función asíncrona para obtener el saldo de la cuenta
     * Consulta la API de Horizon Testnet
     * 
     * @returns {Promise<void>} Promesa que se resuelve cuando se completa la consulta del saldo
     */
    const fetchBalance = async () => {
      // Si no hay cuenta activa, no hacemos nada
      if (!activeAccount) return;
      
      // Iniciamos la carga y limpiamos errores previos
      setIsLoading(true);
      setError(null);
      
      try {
        // Realizamos la petición a la API de Horizon
        const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${activeAccount}`);
        
        // Verificamos si la respuesta es correcta
        if (!response.ok) {
          throw new Error(`Error fetching account: ${response.statusText}`);
        }
        
        // Convertimos la respuesta a JSON
        const data = await response.json();
        
        // Buscamos el saldo de XLM (asset nativo)
        const xlmAsset = data.balances.find((b: TokenBalance) => b.asset_type === "native");
        setXlmBalance(xlmAsset ? xlmAsset.balance : "0");
        
        // Buscamos el saldo de USDC (asset no nativo)
        // En testnet, el USDC puede tener diferentes emisores, buscamos por el código de activo
        const usdcAsset = data.balances.find((b: TokenBalance) => 
          b.asset_code === "USDC" && b.asset_type === "credit_alphanum4"
        );
        setUsdcBalance(usdcAsset ? usdcAsset.balance : "0");
      } catch (err) {
        // Manejamos los errores
        console.error("Error fetching balance:", err);
        setError("No se pudo obtener el saldo de la cuenta");
      } finally {
        // Finalizamos la carga
        setIsLoading(false);
      }
    };

    // Si hay una cuenta activa, obtenemos su saldo
    if (activeAccount) {
      fetchBalance();
    }
  }, [activeAccount]); // El efecto se ejecuta cuando cambia la cuenta activa

  // Si no hay cuenta activa, no renderizamos nada
  if (!activeAccount) {
    return null;
  }

  /**
   * Función que renderiza el contenido del balance según el estado actual
   * Muestra un loader durante la carga, un mensaje de error si hay error,
   * o el saldo si todo está correcto
   * 
   * @returns {JSX.Element} - Elemento JSX con el contenido apropiado
   */
  function renderBalanceContent() {
    // Si está cargando, mostramos un spinner
    if (isLoading) {
      return (
        <div className="balance-loading">
          <Loader size="sm" />
        </div>
      );
    }
    
    // Si hay un error, mostramos el mensaje de error
    if (error) {
      return <div className="balance-error">{error}</div>;
    }
    
    // Formateamos los balances para mostrarlos en la interfaz
    const formattedXlmBalance = formatBalanceForDisplay(xlmBalance);
    const formattedUsdcBalance = formatBalanceForDisplay(usdcBalance);
    
    // Determinamos las clases CSS para los tamaños de fuente
    const xlmFontSizeClass = getBalanceFontSizeClass(formattedXlmBalance);
    const usdcFontSizeClass = getBalanceFontSizeClass(formattedUsdcBalance);
    
    // Si todo está correcto, mostramos los saldos
    return (
      <div className="balance-container">
        {/* Sección de XLM */}
        <div className="token-balance">
          <div className="balance-circle">
            <div className={`balance-amount ${xlmFontSizeClass}`}>
              {formattedXlmBalance}
            </div>
            <div className="balance-symbol">XLM</div>
          </div>
          <div className="balance-details">
            <div className="balance-label">Saldo disponible</div>
            <div className="balance-value">{parseFloat(xlmBalance || "0").toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 7 })} XLM</div>
          </div>
        </div>
        
        {/* Sección de USDC */}
        <div className="token-balance">
          <div className="balance-circle usdc-circle">
            <div className={`balance-amount ${usdcFontSizeClass}`}>
              {formattedUsdcBalance}
            </div>
            <div className="balance-symbol">USDC</div>
          </div>
          <div className="balance-details">
            <div className="balance-label">Saldo disponible</div>
            <div className="balance-value">{parseFloat(usdcBalance || "0").toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 7 })} USDC</div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizamos el componente completo
  return (
    <div className="balance-card">
      <Card variant="secondary">
        <Heading as="h2" size="md">
          Tus Saldos en Stellar
        </Heading>
        
        {/* Renderizamos el contenido según el estado actual */}
        {renderBalanceContent()}
      </Card>
    </div>
  );
};
