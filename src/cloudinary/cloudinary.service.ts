import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { MemoryStoredFile } from 'nestjs-form-data'

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    })
  }

  async uploadImage(
    file: MemoryStoredFile,
    filename?: string,
    folderName?: string,
  ) {
    try {
      const result = await new Promise(
        (resolve: (value: UploadApiResponse | undefined) => void) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: folderName,
                public_id: filename,
              },
              (error, uploadResult) => {
                return resolve(uploadResult)
              },
            )
            .end(file.buffer)
        },
      )
      return result
    } catch (error) {
      throw new Error('Error uploading to Cloudinary: ' + error.message)
    }
  }
}
