# Stellar Balance Checker

La aplicación Stellar Balance Checker es una herramienta sencilla diseñada para consultar los saldos de tu cuenta en la red Stellar de forma rápida y visual.

![para elreadme](https://github.com/user-attachments/assets/84ee15eb-265c-41ce-8395-a537388c889c)

## Requisitos Previos

La aplicación depende de las siguientes dependencias:

- Node (>=16.14.0 <=18.0.0): https://nodejs.org/en/download/
- Yarn (v1.22.5 o más reciente): https://classic.yarnpkg.com/en/docs/install
- Una wallet compatible con Stellar (Freighter, Albedo o XBull): https://www.freighter.app/

## Características

Stellar Balance Checker ofrece las siguientes características:

1. **Integración con múltiples wallets**: La aplicación se integra perfectamente con Freighter, Albedo y XBull, permitiendo a los usuarios conectar su wallet preferida para consultar sus saldos.

2. **Visualización de saldos en tiempo real**: Una vez conectada la wallet, la aplicación muestra los saldos actuales de XLM y USDC en la cuenta del usuario con una interfaz visual atractiva.

3. **Interfaz de usuario intuitiva**: Diseño limpio y moderno que facilita la consulta de saldos con una experiencia de usuario optimizada.

4. **Soporte para múltiples tokens**: Actualmente soporta XLM (nativo) y USDC en la red de pruebas (testnet).

## Instalación

Para instalar y ejecutar la aplicación localmente, sigue estos pasos:

```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Navegar al directorio del proyecto
cd stellar-balance-checker

# Instalar dependencias
yarn install

# Iniciar la aplicación en modo desarrollo
yarn start
```

La aplicación estará disponible en `http://localhost:9000`.

## Uso

1. Abre la aplicación en tu navegador
2. Haz clic en "Conectar Wallet"
3. Selecciona tu wallet preferida (Freighter, Albedo o XBull)
4. Autoriza la conexión
5. ¡Listo! Ahora puedes ver tus saldos de XLM y USDC en la interfaz

## Implementación técnica para obtener el valor del token USDC

### Endpoint de la API utilizado

La aplicación utiliza el endpoint `/accounts/{account_id}` de la API de Horizon Testnet de Stellar para obtener todos los balances de una cuenta, incluyendo XLM y tokens personalizados como USDC:

```
GET https://horizon-testnet.stellar.org/accounts/{account_id}
```

Donde `{account_id}` es la clave pública de la cuenta Stellar (dirección de la wallet).

### Flujo técnico completo

1. **Obtención de la dirección de la wallet**: Cuando el usuario conecta su wallet, se obtiene su clave pública a través del SDK de Stellar Wallets Kit:

   ```typescript
   // En el componente BalanceChecker.tsx
   const publicKey = await SWKKit.getPublicKey();
   setActivePubKey(publicKey);
   ```

2. **Consulta a la API de Horizon**: En el componente `WalletBalance.tsx`, dentro del hook `useEffect`, se realiza la llamada a la API cuando se proporciona una cuenta activa:

   ```typescript
   useEffect(() => {
     const fetchBalance = async () => {
       if (!activeAccount) return;
       
       setIsLoading(true);
       setError(null);
       
       try {
         // Llamada a la API de Horizon Testnet
         const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${activeAccount}`);
         
         if (!response.ok) {
           throw new Error(`Error fetching account: ${response.statusText}`);
         }
         
         const data = await response.json();
         
         // Procesamiento de la respuesta...
       } catch (err) {
         console.error("Error fetching balance:", err);
         setError("No se pudo obtener el saldo de la cuenta");
       } finally {
         setIsLoading(false);
       }
     };

     if (activeAccount) {
       fetchBalance();
     }
   }, [activeAccount]);
   ```

3. **Estructura de la respuesta de la API**: La API de Horizon devuelve un objeto JSON que incluye un array `balances` con todos los activos que posee la cuenta. Cada activo tiene una estructura diferente según su tipo:

   ```json
   {
     "balances": [
       {
         "balance": "100.0000000",
         "asset_type": "native"  // Este es XLM
       },
       {
         "balance": "50.0000000",
         "limit": "922337203685.4775807",
         "asset_type": "credit_alphanum4",
         "asset_code": "USDC",
         "asset_issuer": "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"
       }
     ]
   }
   ```

4. **Extracción de los balances**: Una vez obtenida la respuesta, se extraen los balances de XLM y USDC:

   ```typescript
   // Extracción del balance de XLM (activo nativo)
   const xlmAsset = data.balances.find((b: TokenBalance) => b.asset_type === "native");
   setXlmBalance(xlmAsset ? xlmAsset.balance : "0");
   
   // Extracción del balance de USDC (activo no nativo)
   const usdcAsset = data.balances.find((b: TokenBalance) => 
     b.asset_code === "USDC" && b.asset_type === "credit_alphanum4"
   );
   setUsdcBalance(usdcAsset ? usdcAsset.balance : "0");
   ```

   Donde `TokenBalance` es una interfaz TypeScript que define la estructura de un balance:

   ```typescript
   interface TokenBalance {
     asset_type: string;
     asset_code?: string;
     asset_issuer?: string;
     balance: string;
   }
   ```

5. **Consideraciones sobre el token USDC en Testnet**:
   - En la red de pruebas (testnet) de Stellar, no hay un emisor oficial único para USDC como en la red principal.
   - La aplicación identifica USDC por su código de activo (`asset_code === "USDC"`) y su tipo (`asset_type === "credit_alphanum4"`).
   - No se filtra por el emisor específico (`asset_issuer`) para permitir pruebas con diferentes emisores de USDC en testnet.
   - En un entorno de producción, se debería verificar también el emisor para garantizar que se está utilizando el USDC oficial.

### Diagrama del flujo de datos

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│ Usuario     │     │ Aplicación  │     │ API Horizon Testnet │
│ (Wallet)    │     │ React       │     │                     │
└──────┬──────┘     └──────┬──────┘     └──────────┬──────────┘
       │                   │                       │
       │ Conecta Wallet    │                       │
       ├──────────────────►│                       │
       │                   │                       │
       │                   │ GET /accounts/{id}    │
       │                   ├──────────────────────►│
       │                   │                       │
       │                   │ Respuesta JSON        │
       │                   │◄──────────────────────┤
       │                   │                       │
       │                   │ Procesa balances      │
       │                   │ (XLM y USDC)          │
       │                   │                       │
       │ Muestra balances  │                       │
       │◄──────────────────┤                       │
       │                   │                       │
```

## Tecnologías Utilizadas

- React
- TypeScript
- Stellar SDK
- Stellar Wallets Kit
- Stellar Design System

## Licencia

Apache-2.0
