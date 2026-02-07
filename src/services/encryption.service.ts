import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';

export class EncryptionService {
    // Generate key pair for user
    static generateKeyPair() {
        const keyPair = nacl.box.keyPair();
        return {
            publicKey: encodeBase64(keyPair.publicKey),
            privateKey: encodeBase64(keyPair.secretKey),
        };
    }

    // Encrypt message
    static encryptMessage(
        message: string,
        recipientPublicKey: string,
        senderPrivateKey: string
    ): { encrypted: string; nonce: string } {
        const nonce = nacl.randomBytes(nacl.box.nonceLength);
        const messageUint8 = decodeUTF8(message);
        const recipientPubKeyUint8 = decodeBase64(recipientPublicKey);
        const senderPrivKeyUint8 = decodeBase64(senderPrivateKey);

        const encrypted = nacl.box(
            messageUint8,
            nonce,
            recipientPubKeyUint8,
            senderPrivKeyUint8
        );

        return {
            encrypted: encodeBase64(encrypted),
            nonce: encodeBase64(nonce),
        };
    }

    // Decrypt message
    static decryptMessage(
        encryptedData: string,
        nonce: string,
        senderPublicKey: string,
        recipientPrivateKey: string
    ): string | null {
        try {
            const encryptedUint8 = decodeBase64(encryptedData);
            const nonceUint8 = decodeBase64(nonce);
            const senderPubKeyUint8 = decodeBase64(senderPublicKey);
            const recipientPrivKeyUint8 = decodeBase64(recipientPrivateKey);

            const decrypted = nacl.box.open(
                encryptedUint8,
                nonceUint8,
                senderPubKeyUint8,
                recipientPrivKeyUint8
            );

            if (!decrypted) return null;

            return encodeUTF8(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    // Helper for IndexedDB
    private static async getDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('vigil-secure-storage', 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('keys')) {
                    db.createObjectStore('keys');
                }
            };
        });
    }

    // Store private key securely in IndexedDB
    static async storePrivateKey(privateKey: string, userId: string): Promise<void> {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction('keys', 'readwrite');
                const store = transaction.objectStore('keys');
                const request = store.put(privateKey, `pk_${userId}`);
                
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error storing private key:', error);
            throw error;
        }
    }

    // Retrieve private key (with migration from localStorage)
    static async getPrivateKey(userId: string): Promise<string | null> {
        try {
            // 1. Try to get from IndexedDB first
            const db = await this.getDB();
            const keyFromDB = await new Promise<string | undefined>((resolve, reject) => {
                const transaction = db.transaction('keys', 'readonly');
                const store = transaction.objectStore('keys');
                const request = store.get(`pk_${userId}`);
                
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });

            if (keyFromDB) {
                return keyFromDB;
            }

            // 2. Migration: Check localStorage (legacy)
            const legacyKey = localStorage.getItem(`pk_${userId}`);
            if (legacyKey) {
                console.log('Migrating private key to secure storage...');
                // Move to IndexedDB
                await this.storePrivateKey(legacyKey, userId);
                // Remove from localStorage
                localStorage.removeItem(`pk_${userId}`);
                return legacyKey;
            }

            return null;
        } catch (error) {
            console.error('Error retrieving private key:', error);
            return null;
        }
    }

    // Clear private key on logout
    static async clearPrivateKey(userId: string): Promise<void> {
        try {
            const db = await this.getDB();
            await new Promise<void>((resolve, reject) => {
                const transaction = db.transaction('keys', 'readwrite');
                const store = transaction.objectStore('keys');
                const request = store.delete(`pk_${userId}`);
                
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            
            // Also clear legacy
            localStorage.removeItem(`pk_${userId}`);
        } catch (error) {
            console.error('Error clearing private key:', error);
        }
    }
}
