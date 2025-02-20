import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConnectionDTO } from "./dto/ssh.connection.dto";
import { Client } from "ssh2";
import { error, log } from "console";
import db from "src/config/database.config";
import { Session } from "inspector/promises";


@Injectable()
export class SshConnectService{
    async connectToServer(data:ConnectionDTO , user: any){
        const isValidServer = await db('servers').where({id:data.server_id}).first()
        if(!isValidServer) throw new NotFoundException('Server is not found')

        return new Promise( async (resolve) => {
            const conn = new Client()
            const connectionConfig: any = {
                host: data.ip,
                port: data.port || 22,
                username: data.username
            };
            console.log(data , 'data11');
            

            if(data.auth_type === 'password' && data.password){
                connectionConfig.password = data.password
                // throw new BadRequestException("You entered the password for the connection method but did not enter the password.")
            } else if ( data.auth_type === 'private_key' && data.private_key){
                connectionConfig.private_key = Buffer.from(data.private_key , 'utf-8')
                // throw new BadRequestException("You entered auth_type=private_key but did not enter the private_key ")
            } else {
                resolve({
                    status: "error",
                    message: "Invalid authentication method"
             })
                return ; 
            }

            //Log yozish
            const [Log] = await db('ssh_logs')
                .insert({
                    server_id:data.server_id,
                    status: 'pending',
                    error_msg: null,
                    user_id:user.id,
                    created_at : new Date()
                })
                .returning('id')


            conn
                .on('ready' , async ()=>{
                    console.log(`SSH connection established to ${data.ip}`);
                    await db('ssh_logs').where({id:Log.id}).update({status:'succes'})
                    conn.end();

                    resolve({
                        status:'succes',
                        message:'Connected successfully.',
                        session_id:Log.id
                    });
                })
                .on('error' , async (err)=>{
                    console.log(err);
                    
                    console.error(`SSH connection error : ${err.message}`) 

                    const errorMessage = err.message.includes('Authentication failure')
                    ? 'Authentication failed. Invalid username or password.'
                    : 'Server is not reachable. Please check the network connection.';

                    await db('ssh_logs').where({ id: Log.id }).update({ status: 'failed', error_msg: errorMessage });

                    resolve({
                    status: 'error',
                    message: errorMessage,
                    });
                })
                .connect(connectionConfig)
        })
    }
    async connectToServer2(data:ConnectionDTO , user: any):Promise<any>{
        const conn = new Client()
        conn.on('ready' , ()=>{
            console.log(`SSH connection established to ${data.ip}`);
            conn.end();
        })
        .on('error' , (err)=>{
            console.log(err);
            conn.end()
            return {
                status: 'error',
                message: err.message
            }
        })
        .connect({
            host: data.ip,
            port: data.port || 22,
            username: data.username,
            privateKey:data.private_key
        })
        return {
            status: 'error',
            message: 'Server is not reachable. Please check the network connection.'
        }
    }
    // async checkSshConnection( ){

    //     const user = await 

    // }
    
}