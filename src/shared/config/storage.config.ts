/* eslint-disable prettier/prettier */
export const StorageConfig = {
  photo: {
    destination: '../it-store-storage/photos/',
    urlPrefix: '/assets/photos',
    maxSize: 3 * 1024 * 1024,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    resize: {
        thumb: {
            width: 120, 
            height: 100,
            directory: 'thumb/'
        },
        small: {
            width: 320, 
            height: 240,
            directory: 'small/'
        },
    }
  }
};
