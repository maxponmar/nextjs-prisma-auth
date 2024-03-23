import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import db from "../../../../libs/db";

export async function POST(request) {
  try {
    const data = await request.json();
    console.log(data);

    if (data.password !== data.confirmPassword) {
      return NextResponse.json({
        error: "Passwords do not match",
      });
    }

    const userFound = await db.user.findMany({
      where: {
        OR: [
          {
            email: data.email,
          },
          {
            username: data.username,
          },
        ],
      },
    });

    console.log(userFound);

    if (userFound.length > 0) {
      return NextResponse.json(
        {
          error: "User already exists",
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await db.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        roleId: "1377baaa-fd07-40b3-9c15-b48e43db16a4",
      },
    });

    const { password: _, ...user } = newUser;

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error,
      },
      { status: 500 }
    );
  }
}
