-- ======================================================
-- SISTEMA DE RECONHECIMENTO FACIAL INCLUSIVO
-- Baseado em landmarks do MediaPipe FaceMesh
-- ======================================================

CREATE DATABASE IF NOT EXISTS sistema_faceid
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE sistema_faceid;

-- ======================================================
-- TABELA DE USUÁRIOS
-- ======================================================
CREATE TABLE usuarios_catraca(
  usuario_id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
  usuario_nome VARCHAR(100) NOT NULL,
  usuario_documento BIGINT NOT NULL UNIQUE,
  usuario_genero ENUM('feminino','masculino','não-binário','outro','prefiro não informar') NOT NULL,
  usuario_etnia ENUM('preto','pardo', 'branco','indígena','amarelo','outro','prefiro não informar') NOT NULL,
  usuario_faixa_etaria ENUM('Menor de 18','18 a 29','30 a 44','45 a 59','60+','prefiro não informar')NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) DEFAULT CHARSET = utf8mb4;

-- ======================================================
-- TABELA DE AMOSTRAS (LANDMARKS DO ROSTO)
-- ======================================================
CREATE TABLE amostra_face (
  amostra_id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  embedding JSON NOT NULL, -- landmarks capturados (x, y, z)
  criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
  usado_para_treinamento BOOLEAN DEFAULT FALSE,
  comentario VARCHAR(255),
  FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id) ON DELETE CASCADE,
  INDEX (usuario_id)
) DEFAULT CHARSET = utf8mb4;

ALTER TABLE amostra_face
DROP FOREIGN KEY amostra_face_ibfk_1;

ALTER TABLE amostra_face
ADD CONSTRAINT fk_amostra_usuario
FOREIGN KEY (usuario_id)
REFERENCES usuarios_catraca(usuario_id)
ON DELETE CASCADE;

SHOW CREATE TABLE amostra_face;
SELECT * FROM amostra_face;

-- ======================================================
-- TABELA DE LOGS DE TENTATIVAS DE RECONHECIMENTO
-- ======================================================
CREATE TABLE login_acesso (
  login_id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NULL,
  tentativa_nome VARCHAR(100) NULL,
  data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  metodo VARCHAR(50) NOT NULL,           -- Ex: 'mediapipe-facemesh'
  similaridade FLOAT NULL,               -- Distância ou pontuação de similaridade
  resultado ENUM('sucesso','falha','nao_encontrado') NOT NULL,
  ip_origem VARCHAR(45) NULL,
  detalhes JSON NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuario(usuario_id) ON DELETE SET NULL,
  INDEX (data_hora),
  INDEX (usuario_id)
) DEFAULT CHARSET = utf8mb4;

-- ======================================================
-- TABELA DE LOGIN DO SISTEMA (NÃO BIOMÉTRICO)
-- ======================================================
CREATE TABLE cadastro_administrador (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL
) DEFAULT CHARSET = utf8mb4;

Select * from cadastro_administrador;
Select * from usuarios_catraca;