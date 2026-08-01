# G26 S1 Proyecto Final

Proyecto universitario desarrollado con Next.js y Tailwind CSS para consultar informacion bancaria publicada por la Comision para el Mercado Financiero de Chile.

## Funcionalidades

- Pagina de inicio con acceso a las consultas principales.
- Listado y busqueda de instituciones bancarias.
- Consulta del ultimo balance mensual disponible.
- Resumen visual de activos pasivos y patrimonio usando subtotales oficiales.
- Explicacion simple de la ecuacion contable basada en la estructura de NIC 1.
- Consulta del ultimo estado de resultados disponible.
- Resumen visual de ingresos gastos y resultado usando subtotales oficiales.
- Secciones desplegables para entender las cuentas sin perder el detalle tecnico.
- Tablas con las cuentas informadas por la CMF.
- Logos locales para identificar cada banco.
- Mensajes claros para errores de conexion o de la API Key.

## Arquitectura del proyecto

Se conserva la arquitectura base entregada en el repositorio. El contenido propio de cada ruta permanece dentro de su archivo `page.tsx`.

```text
app/
├── balances/
│   └── page.tsx             # Consulta de balances
├── landing/
│   └── page.tsx             # Pagina de inicio
├── resultados/
│   ├── loading.tsx          # Estado de carga
│   └── page.tsx             # Consulta de resultados
├── globals.css              # Tailwind y tema general
├── layout.tsx               # Layout principal y metadata
└── page.tsx                 # Redireccion hacia landing

components/
└── global/
    ├── Footer.tsx           # Pie compartido
    └── Navbar.tsx           # Navegacion compartida

public/
└── bank-logos/              # Logos bancarios por codigo CMF
```

`Navbar` y `Footer` son los unicos componentes visuales compartidos. Los formularios las tarjetas las tablas y la logica de cada consulta se mantienen en sus paginas correspondientes.

## API Key de la CMF

Para este trabajo academico Francisco Labra autorizo compartir la API Key con sus companeros. La clave se encuentra en `.env.example`.

Para usarla se debe crear `.env.local` a partir del ejemplo:

```powershell
Copy-Item .env.example .env.local
```

La variable utilizada por el proyecto es:

```env
CMF_API_KEY=clave_entregada_por_la_cmf
```

Aunque la clave se comparte para fines academicos las consultas se realizan desde componentes de servidor. La clave no se envia mediante codigo JavaScript al navegador.

La CMF establece una cuota mensual de consultas. Todos los integrantes deben evitar recargar las paginas de manera innecesaria.

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

Luego se puede abrir:

- `http://localhost:3000/landing`
- `http://localhost:3000/balances`
- `http://localhost:3000/resultados`

## Verificaciones

```bash
npm run lint
npm run build
```
