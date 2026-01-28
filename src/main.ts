import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ===== CONFIGURAR VALIDACIÓN GLOBAL =====
  app.useGlobalPipes(
    new ValidationPipe({
      // Eliminar propiedades no declaradas en DTO
      whitelist: true,
      // Lanzar error si hay propiedades no declaradas
      forbidNonWhitelisted: true,
      // Transformar objetos planos a instancias de clases DTO
      transform: true,
      // Transformar tipos primitivos (string -> number, etc)
      transformOptions: {
        enableImplicitConversion: true,
      },
      // Mostrar errores de validación detallados
      errorHttpStatusCode: 400,
    }),
  );

  // ===== HABILITAR CORS =====
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ===== AGREGAR MIDDLEWARE PARA GENERAR REQUEST ID =====
  app.use((req: any, res: any, next: any) => {
    req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    next();
  });

  await app.listen(configService.get('server').port);
  console.log(`✅ Application is running on port ${configService.get('server').port}`);
}

bootstrap().catch((err) => {
  console.error('❌ Error during application bootstrap:', err);
  process.exit(1);
});