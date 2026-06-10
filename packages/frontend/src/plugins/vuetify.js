import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'
import { pt } from 'vuetify/locale'

import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components: {
    ...components,
    ...labsComponents,
  },

  directives,

  locale: {
    locale: 'pt',
    messages: {
      pt: {
        ...pt,
        dataFooter: {
          itemsPerPageText: 'Itens por página',
          itemsPerPageAll: 'Todos',
          pageText: '{0}-{1} de {2}',
        },
      },
    },
  },

  icons: {
    defaultSet: 'mdi',
  },

  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1B5438',
          secondary: '#C8A220',
          background: '#F4F8F4',
          surface: '#FAFAF8',
          error: '#B00020',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
    },
  },
})