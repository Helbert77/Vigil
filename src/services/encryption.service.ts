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

    // Store private key securely (localStorage with user password - simplified for now)
    static storePrivateKey(privateKey: string, userId: string) {
        localStorage.setItem(`pk_${userId}`, privateKey);
    }

    // Retrieve private key
    static getPrivateKey(userId: string): string | null {
        return localStorage.getItem(`pk_${userId}`);
    }

    // Clear private key on logout
    static clearPrivateKey(userId: string) {
        localStorage.removeItem(`pk_${userId}`);
    }
}
