/* eslint-disable prettier/prettier */
export const StorageConfig = {
  photo: {
    destination: '../it-store-storage/photos/',
    maxSize: 3 * 1024 * 1024,
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
