export class PostDto {
  description!: string;
  userId!: number;
  files!: Express.Multer.File[];
}
