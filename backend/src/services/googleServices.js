const { Storage } = require('@google-cloud/storage');
const { env } = require("../conf/environment");

// Ініціалізація клієнта Cloud Storage
const storage = new Storage({
    keyFilename: env.googlefile,
    projectId: env.googleProjectId
});

const bucket = storage.bucket(env.bucketName);

/**
 * Google Cloud Storage Service
 */
const googleServices = {
    /**
     * Завантаження файлу в Bucket
     */
    uploadFile: async (filePath, destinationName) => {
        try {
            await bucket.upload(filePath, {
                // Додаємо метадані для кращої ідентифікації
                destination: `${env.googleProjectId}/${destinationName}.json`,
                gzip: true,
                metadata: {
                    cacheControl: 'public, max-age=31536000',
                },
            });
            console.log(`☁️ Cloud: File ${destinationName} successfully backed up.`);
        } catch (err) {
            console.error(`❌ Cloud Upload Error: ${err.message}`);
        }
    },

    /**
     * Видалення файлу з хмари
     */
    deleteFile: async (fileName) => {
        try {
            await bucket.file(`${env.googleProjectId}/${fileName}`).delete();
            console.log(`☁️ Cloud: File ${fileName} deleted.`);
        } catch (err) {
            console.error(`❌ Cloud Delete Error: ${err.message}`);
        }
    },

    /**
     * Завантаження файлу з хмари на локальний сервер
     */
    downloadFile: async (fileName, localSavePath) => {
        try {
            await bucket.file(`${env.googleProjectId}/${fileName}`).download({
                destination: localSavePath,
            });
            console.log(`☁️ Cloud: ${fileName} restored to ${localSavePath}`);
        } catch (err) {
            console.error(`❌ Cloud Download Error: ${err.message}`);
        }
    },

    /**
     * Перегляд усіх файлів у папці проекту
     */
    showAllFiles: async () => {
        try {
            const [files] = await bucket.getFiles({ prefix: `${env.googleProjectId}/` });
            console.log('📂 Cloud Storage Files:');
            files.forEach(file => console.log(` - ${file.name}`));
            return files;
        } catch (err) {
            console.error(`❌ Cloud Listing Error: ${err.message}`);
        }
    }
};

module.exports = googleServices;