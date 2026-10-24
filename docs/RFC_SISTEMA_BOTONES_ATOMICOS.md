# RFC: Sistema Atómico de Botones (`AppButton`)

## Contexto y Motivación
Actualmente, el proyecto cuenta con 84 llamadas directas a `<Button />` de Material UI. Aunque en `theme.ts` existe una configuración global (`unifiedButtonOverrides`), en la práctica:
- Se duplican definiciones locales mediante `styled(Button)` en al menos 8 archivos clave.
- Existen más de 20 casos de estilos en línea (`sx={{ backgroundColor: '#f25600' }}`).
- El manejo del estado de carga (`loading`) y spinners se resuelve ad-hoc en cada pantalla, lo que provocó regresiones recientes de doble submit.

## Objetivo
Implementar un átomo `AppButton` bajo Atomic Design que centralice:
1. Variantes semánticas (`primary`, `secondary`, `destructive`, `outlined`, `text`).
2. Soporte nativo de `loading` (spinner automático y bloqueo de clics).
3. Eliminación de estilos `sx` hardcodeados en los componentes consumidores.

## API Propuesta

```typescript
// src/components/atoms/AppButton/AppButton.tsx
export type AppButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outlined' | 'text';

export interface AppButtonProps extends Omit<ButtonProps, 'variant' | 'color'> {
  variant?: AppButtonVariant;
  loading?: boolean;
}
```

## Plan de Ejecución
1. Crear el átomo en `src/components/atoms/AppButton/`.
2. Probar integración en componentes atómicos y moleculares (`ConfirmationModal`, `NavButton`).
3. Reemplazar `styled(Button)` en flujos principales.
4. Documentar en el `agent.md` del front.
