
![image](https://github.com/daminnock/ChainSentinel/blob/main/images/Logo.png)

ChainSentinel es un SCADA basado en la tecnología blockchain que permite el monitoreo y control remoto de procesos industriales.

## Problema

Los sistemas SCADA reciben información sobre eventos, estados y mediciones que ocurren dentro de un sistema industrial.
Actualmente implementan una arquitectura donde la información se almacena en hasta dos servidores que están localizados en dos lugares distintos para dar redundancia.

![image](https://github.com/daminnock/ChainSentinel/blob/main/images/Redundant_Convencional_SCADA_Architecture.JPG)

Los registros y la disponibilidad del SCADA suelen ser críticos en cualquier industria y son un blanco de ataque para hackers de sombrero negro.

En algunos casos, la vida de las personas depende de forma muy sensible en sistemas controlados por SCADAs como sucede en los sistemas de suministro eléctrico. En este segmento de la indsutria los estados dan concesiones a las empresas para que provean esos servicios y no hay razón para que la información esté disponible para cada individuo.

También existe un interés en el acceso libre y seguro a información de la red eléctrica bajo el moderno concepto de las smart grids, donde un individuo puede proveer energía a la red y ganar dinero por ello.

## Demos

[**Web Demo**](https://chainsentinel.epikapp.io/)

[**Video introductorio**](https://youtu.be/neJ6SwkNwJk)


## Solución

ChainSentinel permite crear una plataforma basada en la seguridad del concepto de blockchain para almacenar registros históricos de interés en la blockchain y conocer el estado de los sistemas.

![image](https://github.com/daminnock/ChainSentinel/blob/main/images/Blockchain_SCADA_Architecture.JPG)


## ¿Cómo funciona?

Te invito a revisar nuestro [documento](https://github.com/daminnock/ChainSentinel/blob/main/descentralized_SCADA.pdf) que iremos actualizando durante el desarrollo.


## Tecnologías utilizadas

  - Solidity
  - HardHat
  - Push
  - OpenZeppelin

## Equipo

[**Damián Ariel Minnock**](https://github.com/daminnock)

[**Byron Ballesteros**](https://github.com/byronfba)

[**Francisco Sanchez**](https://github.com/fjsanchezm)

[**Cesar Augusto Galeano Torres**](https://github.com/cesargaleano)

[**Diego Hermida**](https://github.com/die-h)


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Como hacer test del Smart Contract con hardhat

From terminal navigate to the path where everything is going to be saved and get files from repository
```
git clone https://github.com/daminnock/ChainSentinel.git
```
Then install hardhat
```
npm init
npm install --save hardhat
npm install --save-dev @nomicfoundation/hardhat-toolbox
npx hardhat
```
In SCADA.js there is code to test the Smart Contract. With hardhat ready you should execute:
```
npx hardhat test
```

## Como desplegar y probar el smart contract
Previous commands related to hardhat should be executed. Also:

In terminal install dotenv and lite-server:
```
npm install dotenv --save
npm i -g lite-server 
```

Create a .env file where you should declare 2 variables:

Go to alchemy. Log in. Obtain url from there. Declare variable in .env something like:

*STAGING_ALCHEMY_KEY = https://eth-goerli.g.alchemy.com/v2/zaraza-z4r4z4-2r424*

Obtain token private key from metamask. Get sure to select Goerli.

*PRIVATE_KEY = 123a456b.....789xyz*

```
npx hardhat compile
npx hardhat run scripts/deploy.js --network goerli
```
Then you will get an output in terminal like:
SCADA deployed to: 0xABCDE1234567890ABCDE1234567890ABCDE12345
You need to copy that address to index.html in var CONTRACT_ADDRESS
Then execute lite-server
```
cd src/
lite-server
```






