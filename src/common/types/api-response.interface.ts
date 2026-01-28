/**
 * Envelope de respuesta unificado para todas las APIs
 * Sigue el esquema {success, data, error}
 */
export interface ApiResponse<T = unknown> {
  /**
   * Indica si la operación fue exitosa
   */
  success: boolean;

  /**
   * Datos de la respuesta en caso de éxito
   */
  data?: T;

  /**
   * Información del error en caso de fallo
   */
  error?: ApiError;

  /**
   * Timestamp de la respuesta
   */
  timestamp: string;

  /**
   * ID único de la solicitud para trazabilidad
   */
  requestId: string;
}

/**
 * Estructura del error en la respuesta
 */
export interface ApiError {
  /**
   * Código de error tipado único
   */
  code: string;

  /**
   * Mensaje descriptivo del error
   */
  message: string;

  /**
   * Detalles adicionales del error (stack, metadata, etc)
   */
  details?: Record<string, unknown>;

  /**
   * Tipo de error: BRIDGE, ADAPTER, VALIDATION, INTERNAL, etc
   */
  type: ErrorType;
}

export enum ErrorType {
  // Errores del Bridge
  BRIDGE = 'BRIDGE',

  // Errores de Adapters
  ADAPTER_STELLAR = 'ADAPTER_STELLAR',
  ADAPTER_LAYERZERO = 'ADAPTER_LAYERZERO',
  ADAPTER_HOP = 'ADAPTER_HOP',

  // Errores de validación
  VALIDATION = 'VALIDATION',

  // Errores internos
  INTERNAL = 'INTERNAL',

  // Errores de configuración
  CONFIG = 'CONFIG',

  // Errores externos (third-party APIs)
  EXTERNAL = 'EXTERNAL',

  // Errores de autenticación/autorización
  AUTH = 'AUTH',
}
