import { Injectable } from '@angular/core';
import * as ed25519 from '@noble/ed25519';
import { sha512 } from '@noble/hashes/sha2';
import { ILicense } from './license.interface';

@Injectable({
  providedIn: 'root',
})
export class LicenseService {
  publicKeyHex = '';
  isVerified = false;

  constructor() {
    fetch('/assets/config.json')
      .then((res) => res.json())
      .then((cfg) => (this.publicKeyHex = cfg.publicKeyHex));
    ed25519.etc.sha512Sync = sha512;
  }

  async verifyAndDecrypt(
    fileContent: string,
    licenseKey: string,
    prettyPrint = false
  ): Promise<string | ILicense> {
    const base64Payload = fileContent
      .replace(/^-----BEGIN LICENSE FILE-----\n/, '')
      .replace(/\n/g, '')
      .replace(/-----END LICENSE FILE-----\n?$/, '');

    const payloadStr = atob(base64Payload);
    const licenseData = JSON.parse(payloadStr);

    if (licenseData.alg !== 'aes-256-gcm+ed25519') {
      this.isVerified = false;
      throw new Error('Unsupported algorithm!');
    }

    const signature = this.base64ToBytes(licenseData.sig);
    const signingData = new TextEncoder().encode(`license/${licenseData.enc}`);
    const publicKey = this.hexToBytes(this.publicKeyHex);

    const isValid = await ed25519.verify(signature, signingData, publicKey);

    if (!isValid) {
      this.isVerified = false;
      throw new Error('Invalid license file!');
    }

    const [cipherTextB64, ivB64, tagB64] = licenseData.enc.split('.');
    const cipherText = this.base64ToBytes(cipherTextB64);
    const iv = this.base64ToBytes(ivB64);
    const tag = this.base64ToBytes(tagB64);

    // Hash license key to get 256-bit secret
    const keyMaterial = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(licenseKey)
    );
    const key = await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const encryptedBytes = new Uint8Array([...cipherText, ...tag]);

    let decrypted: string;
    try {
      const plaintextBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedBytes
      );
      decrypted = new TextDecoder().decode(plaintextBuffer);
    } catch (err) {
      this.isVerified = false;
      throw new Error('Failed to decrypt license file');
    }

    if (prettyPrint) {
      try {
        const obj = JSON.parse(decrypted);
        return JSON.stringify(obj, null, 2);
      } catch {
        return decrypted; // fallback
      }
    }

    return JSON.parse(decrypted) as ILicense;
  }

  async verifyLicense(): Promise<ILicense> {
    const licenseKey = localStorage.getItem('licenseKey');
    if (licenseKey) {
      const licenseFileContent = localStorage.getItem('licenseFileContent');
      if (licenseFileContent) {
        const decryptedContent: ILicense = (await this.verifyAndDecrypt(
          licenseFileContent,
          licenseKey,
          false
        )) as ILicense;
        if (
          decryptedContent.meta.expiry &&
          new Date(decryptedContent.meta.expiry) < new Date()
        ) {
          console.warn('License has expired.');
          this.isVerified = false;
          throw new Error('License has expired.');
        } else {
          this.isVerified = true;
          return decryptedContent; // License is valid
        }
      } else {
        console.warn('No license file content found in local storage.');
        this.isVerified = false;
        throw new Error('No license file content found in local storage.');
      }
    } else {
      console.warn('No license key found in local storage.');
      this.isVerified = false;
      throw new Error('No license file content found in local storage.');
    }
  }

  /**
   * Saves the license key and file content to local storage.
   * @param licenseKey The license key to save.
   * @param licenseFileContent The content of the license file to save.
   */
  saveLicense(licenseKey: string, licenseFileContent: string): void {
    localStorage.setItem('licenseKey', licenseKey);
    localStorage.setItem('licenseFileContent', licenseFileContent);
  }

  private base64ToBytes(b64: string): Uint8Array {
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  }

  private hexToBytes(hex: string): Uint8Array {
    return new Uint8Array(
      hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
  }
}
