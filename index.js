import fs from 'fs'
import  {Client} from 'ssh2'

const conn = new Client()

const privateKey = fs.readFileSync("/home/baxa/.ssh/weather app.pem")

conn.on('ready', () => {
    console.log('SSH ulanishi muvaffaqiyatli!');
  
    conn.sftp((err, sftp) => {
      if (err) {
        console.error('SFTP ulanishi xatosi:', err);
        conn.end();
        return;
      }
  
      const localFilePath = '/home/baxa/Desktop/papka/migratsiyaBilanIshlash.txt';  // Lokal kompyuterdagi fayl
      const remoteFilePath = '/home/ubuntu/papka/salom.txt';  // Remote server yo‘li
  
      sftp.fastPut(localFilePath, remoteFilePath, (err) => {
        if (err) {
          console.error('Fayl yuklashda xato:', err);
        } else {
          console.log('Fayl remote serverga yuklandi!');
        }
        conn.end();
      });
    });
  }).connect({
    host:"ec2-13-51-163-128.eu-north-1.compute.amazonaws.com",
    port:22,
    username:"ubuntu" , 
    privateKey: privateKey
}


)
console.log(privateKey , 1212);
