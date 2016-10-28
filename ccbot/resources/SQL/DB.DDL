CREATE TABLE IF NOT EXISTS USERS (USERID VARCHAR(40) PRIMARY KEY,
                                  PASS VARCHAR(100) NOT NULL,
                                  ACTIVE BOOLEAN);
                                  
CREATE TABLE IF NOT EXISTS NODE (IP CHAR(100) PRIMARY KEY,
                                    SHORTN VARCHAR(20) NOT NULL,
                                    NAME VARCHAR(30),
                                    PUBKEY VARCHAR(300),
                                    VALID BOOLEAN);
                                     
CREATE TABLE IF NOT EXISTS CONFIGURACION (ID INT PRIMARY KEY AUTO_INCREMENT,
                                          IP CHAR(100),
                                          APPL CHAR(30),
                                          INST CHAR(30),
                                          CAMPO VARCHAR(30) NOT NULL,
                                          VALOR VARCHAR(1000));
-- cambiar a longitud 1000 el valor
                                      
CREATE TABLE IF NOT EXISTS ESTADISTICA (ID INT PRIMARY KEY AUTO_INCREMENT,
                                        APPL CHAR(30) NOT NULL,
                                        INST CHAR(30) NOT NULL,
                                        STATE CHAR(30) NOT NULL,
                                        INICIO TIMESTAMP NOT NULL,
                                        DELTA INT NOT NULL,
                                        ENVIADO TIMESTAMP,
                                        CODIGO INT NOT NULL,
                                        EJECUCION INT NOT NULL,
                                        MENSAJE VARCHAR(300));
                                        
CREATE TABLE IF NOT EXISTS CESTADISTICA (ID INT PRIMARY KEY AUTO_INCREMENT,
                                        APPL VARCHAR(30) NOT NULL,
                                        INST VARCHAR(30) NOT NULL,
                                        STATE VARCHAR(30) NOT NULL,
                                        INICIO TIMESTAMP NOT NULL,
                                        DELTA INT NOT NULL,
                                        RECIBIDO TIMESTAMP,
                                        CODIGO INT NOT NULL,
                                        EJECUCION INT NOT NULL,
                                        MENSAJE VARCHAR(300),
                                        IP VARCHAR(100),
                                        SHORTN VARCHAR(20),
                                        CONCENTRADO TIMESTAMP);

ALTER TABLE CONFIGURACION ADD CONSTRAINT IF NOT EXISTS CONF_NOD_FK FOREIGN KEY(IP) REFERENCES NODE(IP) ON DELETE CASCADE;
-- ALTER TABLE CESTADISTICA ADD CONSTRAINT IF NOT EXISTS CEST_NOD_FK FOREIGN KEY(IP) REFERENCES NODE(IP) ON DELETE RESTRICT;

CREATE TABLE IF NOT EXISTS PAGINAS
       (ID_PAGINA INT PRIMARY KEY AUTO_INCREMENT,
        INICIO TIMESTAMP NOT NULL,
        NOMBRE_ESTADO VARCHAR(50) NOT NULL,
        CARGA_CONTENIDO INT NOT NULL,
        TIEMPO_CARGA INT NOT NULL);

CREATE TABLE IF NOT EXISTS ELEMENTOS_PAGINA
       (ID_ELEM_PAGINA INT PRIMARY KEY AUTO_INCREMENT,
        ID_PAGINA INT NOT NULL,
        URL VARCHAR (2000) NOT NULL,
        STATUS INT NOT NULL,
        TAMANYO INT NOT NULL,
        TIPO_CONTENIDO VARCHAR (30),
        TIEMPO_TOTAL INT NOT NULL,
        TIEMPO_BLOQUEO INT NOT NULL,
        TIEMPO_DNS INT NOT NULL,
        TIEMPO_CONEXION INT NOT NULL,
        TIEMPO_ENVIO INT NOT NULL,
        TIEMPO_RECEPCION INT NOT NULL,
        TIEMPO_ESPERA INT NOT NULL);

ALTER TABLE ELEMENTOS_PAGINA ADD CONSTRAINT IF NOT EXISTS ELEM_PAGINA_FK FOREIGN KEY(ID_PAGINA) REFERENCES PAGINAS(ID_PAGINA ) ON DELETE CASCADE;

                                     
