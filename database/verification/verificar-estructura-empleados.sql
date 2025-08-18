-- Verificar estructura de tabla empleados
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'empleados' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Ver datos de empleados para entender la estructura
SELECT * FROM empleados LIMIT 3;
