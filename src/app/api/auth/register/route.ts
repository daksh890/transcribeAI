import { NextResponse } from "next/server";
import { getDataSource } from "../../../../lib/db/data-source";
import { User, Session} from "../../../../lib/db/entities/index";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export async function POST(req:Request){
    try{
        const body = await req.json();
        const {name, email, password} = body;
        
        if(!name || !email || !password){
            return NextResponse.json({error: "Missing required fields"}, {status:400});
        }

        const ds = await getDataSource();
        const userRepo = ds.getRepository(User);

        const existingUser = await userRepo.findOne({where: {email}});
        if(existingUser){
            return NextResponse.json({error: "User already exists"}, {status:400});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        //Create User
        const newUser = userRepo.create({
            name,
            email,
            password: hashedPassword
        });
        await userRepo.save(newUser);

        //Create Session
        const sessionRepo = ds.getRepository(Session);
        const session = sessionRepo.create({ user:newUser });
        await sessionRepo.save(session);

        
        const token = jwt.sign(
            {userId: newUser.id, email: newUser.email, sessionId: session.id},
            process.env.JWT_SECRET || "defaultsecret",
            {expiresIn: "7d"}
        );
        const res = NextResponse.json({
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
        });

        //Set cookie
        res.cookies.set({
            name: "token",
            value: token,
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 30 days
        });

        return res;
        
    } catch (err) {

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
    
}