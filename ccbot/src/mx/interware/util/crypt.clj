(ns mx.interware.util.crypt
  (:import (java.security MessageDigest Signature PrivateKey KeyFactory KeyPairGenerator AlgorithmParameters SecureRandom)
          (java.security.spec PKCS8EncodedKeySpec)
          (javax.crypto EncryptedPrivateKeyInfo SecretKeyFactory Cipher KeyGenerator)
          (javax.crypto.spec PBEKeySpec SecretKeySpec))
  (:require [clojure.data.codec.base64 :as base64]))

(defn get-raw-key [seed]
  (let [keygen (KeyGenerator/getInstance "AES")
        sr (SecureRandom/getInstance "SHA1PRNG")]
    (.setSeed sr (.getBytes seed "UTF-8"))
    (.init keygen 128 sr)
    (.. keygen generateKey getEncoded)))

(defn get-cipher [mode seed]
  (let [key-spec (SecretKeySpec. (get-raw-key seed) "AES")
        cipher (Cipher/getInstance "AES")]    ;AES
    (.init cipher mode key-spec)
    cipher))

(defn do-asymetric [msg key mode algo]
  (let [cipher (doto (Cipher/getInstance algo)
                 (.init mode key))
        bs (if (= mode Cipher/ENCRYPT_MODE) 53 64) ; maximo para llaves RSA(512)
        bos (java.io.ByteArrayOutputStream.)
        in (if (= mode Cipher/ENCRYPT_MODE)
             (.getBytes msg "UTF-8")
             (base64/decode (.getBytes msg "UTF-8")))
        length (count in)]
    (loop [start 0]
      (let [len (min bs (- length start))
            bytes (.doFinal cipher in start len)]
        (.write bos bytes 0 (count bytes))
        (if (< (+ start len) length)
          (recur (+ start len)))))
    (if (= mode Cipher/ENCRYPT_MODE)
      (String. (base64/encode (.toByteArray bos)) "UTF-8")
      (String. (.toByteArray bos) "UTF-8"))))


(defn encrypt-asymetric [msg key]
  (do-asymetric msg key Cipher/ENCRYPT_MODE "RSA/ECB/PKCS1Padding")) ;ECB
  
  
(defn decrypt-asymetric [msg key]
  (do-asymetric msg key Cipher/DECRYPT_MODE "RSA/ECB/PKCS1Padding"))

(defn encrypt-symetric [text key]
  (let [bytes (.getBytes text "UTF-8")
        cipher (get-cipher Cipher/ENCRYPT_MODE key)]
    (String. (base64/encode (.doFinal cipher bytes)) "UTF-8")))

(defn decrypt-symetric [text key]
  (let [cipher (get-cipher Cipher/DECRYPT_MODE key)]
    (String. (.doFinal cipher (base64/decode (.getBytes text "UTF-8"))))))

(defn create-key-pair []
  (let [kpg (doto (java.security.KeyPairGenerator/getInstance "RSA")
              (.initialize 512))
        kpair (.genKeyPair kpg)
        privK (.getPrivate kpair)
        pubK (.getPublic kpair)]
    [(String. (base64/encode (.getEncoded pubK) )) (String. (base64/encode (.getEncoded privK))) kpair]))

(comment defn build-public [pub-key-str]
  (let [pub-key-spec  (java.security.spec.X509EncodedKeySpec. (.getBytes pub-key-str))
        key-factory (java.security.KeyFactory/getInstance "RSA" "SUN")
        public (.generatePublic key-factory pub-key-spec)]
    public))

(defn str->private ^java.security.PrivateKey [^String priv-key64]
  (let [clear (base64/decode (.getBytes priv-key64))
        keySpec (java.security.spec.PKCS8EncodedKeySpec. clear)
        fact (KeyFactory/getInstance "RSA")
        priv (.generatePrivate fact keySpec)]
    priv))

(defn str->public ^java.security.PublicKey [^String pub-key64]
  (let [data (base64/decode (.getBytes pub-key64))
        keyspec (java.security.spec.X509EncodedKeySpec. data)
        fact (KeyFactory/getInstance "RSA")]
    (.generatePublic fact keyspec)))

(defn private->str ^String [^java.security.PrivateKey priv]
  (let [fact (KeyFactory/getInstance "RSA")
        spec (.getKeySpec fact priv java.security.spec.PKCS8EncodedKeySpec)
        packed (.getEncoded spec)
        key64 (String. (base64/encode packed))]
    key64))

(defn public->str ^String [^java.security.PublicKey publ]
  (let [fact (KeyFactory/getInstance "RSA")
        spec (.getKeySpec fact publ java.security.spec.X509EncodedKeySpec)
        key64 (String. (base64/encode (.getEncoded spec)))]
    key64))


(defn test-it1 []
  (let [[pub-str priv-str pair] (create-key-pair)
        pub1 (.getPublic pair)
        priv1 (.getPrivate pair)
        pub2 (str->public pub-str)
        priv2 (str->private priv-str)
        ]
    (assert (= pub-str (public->str  pub1)) "Si 1")
    (assert (= priv-str (private->str priv1)) "Si 2")
    (assert (= pub-str (public->str pub2)) "Si 3")
    (assert (= priv-str (private->str priv2)) "Si 4")
    
    (assert (= priv1 priv2) "Si 5")
    [priv1 priv2 pair]
    ))

(defn test-it2 []
  (let [[pub-str priv-str pair] (create-key-pair)
        msg (reduce str (repeat 500 "123456789 123456789 123456789 123456789 123456789 123"))
        enc (encrypt-asymetric msg (str->public pub-str)) ; (.getPublic pair)) ;
        msg2 (decrypt-asymetric enc (str->private priv-str))
        enc2 (encrypt-asymetric msg (str->private priv-str)) ; (.getPublic pair)) ;
        msg3 (decrypt-asymetric enc2 (str->public pub-str))]
    (assert (= msg msg2 msg3) "Problemas de encripcion asymetrica")
    (assert (not= enc enc2))
    { :length-pub-str (.length pub-str)
     :length-priv-str (.length priv-str)
     :pub-str pub-str
     :length-msg (.length msg)
     :length-enc1 (.length enc)
     :length-enc2 (.length enc2)
     :enc (subs enc 0 100)
     :enc2 (subs enc2 0 100)
     }))

(defn test-it3 []
  (let [[_ _ kp] (create-key-pair)
        
        publicKey (.getPublic kp)
        privateKey (.getPrivate kp)
 
        text "Testmessage asdasdadasdasdadasdasdasd"
        cipher (doto (Cipher/getInstance "RSA")
                 (.init Cipher/ENCRYPT_MODE privateKey))
        x (String. (base64/encode (.doFinal cipher (.getBytes text "UTF-8"))))]
    (.init cipher Cipher/DECRYPT_MODE publicKey)
    [(String. x) (String. (.doFinal cipher (base64/decode (.getBytes x "UTF-8"))) "UTF-8")]))

(comment
)