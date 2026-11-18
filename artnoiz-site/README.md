# ARTNOIZ.CL

Sitio estático para presentar los productos de Art Noiz, recibir consultas por WhatsApp y mostrar archivos STL terminados en un visor 3D.

## Qué incluye

- Portada y navegación adaptable a teléfono.
- Catálogo de figuras tipo Funko, ToysNoiz y ToysNoiz 2.
- Llaveros por unidad o por mayor, souvenirs impresos en 3D y figuras personalizadas.
- Galería con filtros por categoría.
- Cotizador que arma un mensaje y lo continúa en WhatsApp.
- Visor de STL con rotación, acercamiento y vista de malla.
- Enlaces a Instagram, TikTok, correo y WhatsApp.
- Imágenes de referencia para la maqueta. Sustitúyelas por fotografías reales de tus piezas cuando las tengas.

No hay checkout, cobros ni formulario con almacenamiento: la página prepara la conversación de WhatsApp y el cliente decide qué archivos compartir en el chat.

## Cómo abrir una vista local

El visor usa módulos del navegador, así que esta página debe abrirse desde un servidor web, no como archivo `file://`.

1. Abre esta carpeta en Visual Studio Code.
2. Inicia una vista local con una extensión de servidor estático, o sirve esta carpeta con Python usando `python -m http.server 4173`.
3. Abre `http://localhost:4173` en el navegador.

## GitHub y publicación

El proyecto puede guardarse gratis como código en GitHub. GitHub Pages no es adecuado para publicar esta página comercial de cotizaciones: sus reglas dicen que el servicio gratuito no está destinado a alojar negocios en línea. Por eso esta carpeta queda preparada como sitio estático, pero no se publica en GitHub Pages.

Para publicarla, conecta el repositorio a un servicio de alojamiento que permita páginas comerciales. El proyecto no requiere instalación, comando de construcción ni variables secretas; `index.html` es la página principal.

El sitio no necesita una clave de API ni envía fotos o modelos STL a un servidor. El visor descarga los modelos públicos que ARTNOIZ incluya en `models/` y procesa los archivos elegidos por el cliente dentro de su navegador.

## Enlaces y datos de contacto

Edita `js/config.js` para cambiar WhatsApp, Instagram, TikTok o correo. El número actual se encontró en el proyecto anterior de ARTNOIZ: `+56 9 3120 9309`.

## Publicar tus modelos STL terminados

El catálogo de modelos publicados se configura en `js/models.js`:

1. Copia el STL terminado a `models/`, por ejemplo `models/figura-mateo.stl`.
2. Agrega un elemento al arreglo `publishedModels` con nombre, estilo y ruta:

```js
export const publishedModels = [
  {
    title: 'Figura de Mateo',
    style: 'ToysNoiz 2 · 15 cm',
    url: '/models/figura-mateo.stl'
  }
];
```

3. Vuelve a publicar el sitio desde Vercel. El modelo aparecerá como una opción en el visor.

Los modelos añadidos a la carpeta pública del sitio quedan accesibles para visitantes. Publica solo diseños que estés dispuesto a mostrar. La opción **Subir archivo STL** del visor sirve para revisar un archivo local y no lo publica.

## Identidad y fotografías

El wordmark SVG de `assets/brand/artnoiz-wordmark.svg` se recreó para la cabecera a partir de la referencia de ARTNOIZ encontrada en los chats.

Las imágenes de producto incluidas son visuales ilustrativos generados para esta maqueta y están marcados como referencias dentro de la página. No deben entenderse como fotografías de trabajos reales de ARTNOIZ.
