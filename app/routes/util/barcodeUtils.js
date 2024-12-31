// barcodeUtils.js
import JsBarcode from 'jsbarcode';

export function generateBarcodeBase64(code) {
    return new Promise((resolve, reject) => {
        try {
            const canvas = document.createElement('canvas');
            JsBarcode(canvas, code, { format: 'CODE39',displayValue:false });
            resolve(canvas.toDataURL('image/png'));
        } catch (error) {
            reject(error);
        }
    });
}
