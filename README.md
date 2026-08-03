# CMF Bancos

CMF Bancos es una aplicación web desarrollada con Next.js para consultar información financiera de instituciones bancarias en Chile, utilizando datos públicos disponibilizados por la Comisión para el Mercado Financiero (CMF) a través de la API de SBIF.

La aplicación permite explorar instituciones bancarias, revisar información resumida de balances y estados de resultados, y visualizar datos financieros por período (año y mes). Está orientada a facilitar la consulta rápida de información financiera de forma clara y moderna.

## 🚀 Descripción del proyecto

Este proyecto fue creado como una solución web para consultar datos financieros institucionales de forma sencilla y accesible. Su propósito principal es mostrar información proveniente de la API de la CMF en una interfaz amigable, organizada por secciones:

- Listado de instituciones bancarias registradas.
- Resumen de balances por institución.
- Resumen de resultados por institución.

## 🛠️ Tecnologías utilizadas

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS y CSS Modules

## 📦 Requisitos previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:

- Node.js 20 o superior
- npm o pnpm

## ⚙️ Instalación

1. Clona este repositorio:

```bash
git clone https://github.com/san-nico/G26-S1-proyecto-final
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env.local` en la raíz del proyecto con tu clave de la API de la CMF:

```env
CMF_API_KEY=tu_clave_aqui
```

> La aplicación depende de esta variable para poder consumir los datos desde la API pública de la CMF.

## ▶️ Ejecución local

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Luego abre tu navegador en:

```text
http://localhost:3000
```

## 🧪 Scripts disponibles

Inicia la aplicación en modo desarrollo.

```bash
npm run dev
```

Genera la versión de producción para despliegue.

```bash
npm run build
```

Ejecuta la versión compilada de la aplicación.

```bash
npm run start
```

Ejecuta el análisis estático de ESLint.

```bash
npm run lint
```

## 🌐 Flujo de uso

La aplicación cuenta con tres secciones principales:

- Bancos: muestra el listado de instituciones bancarias.
- Balance: permite visualizar un resumen del balance de una institución específica.
- Resultado: permite ver el resumen de resultados financieros de una institución específica.

## 🔌 Integración con la API

El proyecto consulta datos desde la API de balances y resultados proporcionada por la CMF/SBIF. Para que la aplicación funcione correctamente, es necesario contar con una clave válida en la variable de entorno `CMF_API_KEY`.

Los datos se obtienen en tiempo real al cargar las páginas correspondientes y se representan de forma resumida en tarjetas y vistas estructuradas.
