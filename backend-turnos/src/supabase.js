// Conexión a Supabase
// Lee las variables del archivo .env

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Verificamos que las variables estén cargadas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('❌ Faltan variables de entorno: SUPABASE_URL y SUPABASE_ANON_KEY')
  console.error('   Copiá .env.example como .env y completá los valores')
  process.exit(1)
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

module.exports = supabase
