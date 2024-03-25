import User from "../models/user"
import { StatusCodes } from "http-status-codes"
import { BadRequestError, UnauthenticatedError } from "../errors"
import { Request, Response } from "express"
import mongoose from "mongoose"
import {
    uploadProfileImage,
    uploadAssetsImages,
} from "../utils/imageHandlers/cloudinary"

const updateUser = async (
    userId: mongoose.Schema.Types.ObjectId,
    key: string,
    value: any,
) => {
    const user = await User.findById(userId)
    if (!user) throw new UnauthenticatedError("User Not Found")
    user.set({ [key]: value })
    await user.save()
}

const updateName = async (req: Request, res: Response) => {
    const userId = req.user.userId
    const { name } = req.body
    if (!name) throw new BadRequestError("Name is required")

    await updateUser(userId, "name", name)
    res.status(StatusCodes.OK).json({
        data: { name },
        success: true,
        msg: "Name Updated Successfully",
    })
}
const updateBio = async (req: Request, res: Response) => {
    const userId = req.user.userId
    const { bio } = req.body
    if (!bio) throw new BadRequestError("Bio is required")

    if (bio.length > 150)
        throw new BadRequestError("Bio should be less than 150 characters")

    await updateUser(userId, "bio", bio)
    res.status(StatusCodes.OK).json({
        data: { bio },
        success: true,
        msg: "Bio Updated Successfully",
    })
}
const updateImage = async (req: Request, res: Response) => {
    const userId = req.user.userId
    if (!req.file) throw new BadRequestError("Image is required")

    const cloudinary_img_url = await uploadProfileImage(req)
    await updateUser(userId, "profileImage", cloudinary_img_url)

    res.status(StatusCodes.OK).json({
        success: true,
        msg: "Image Updated Successfully",
    })
}
const getAllAssests = async (req: Request, res: Response) => {
    const userId = req.user.userId
    const user = await User.findById(userId).select("myAssests")
    if (!user) throw new UnauthenticatedError("User Not Found")

    res.status(StatusCodes.OK).json({
        data: user.myAssests,
        success: true,
        msg: "All Assets Fetched Successfully",
    })
}

const uploadAssets = async (req: Request, res: Response) => {
    const userId = req.user.userId
    const files = req.files
    if (!files) throw new BadRequestError("Files are required")

    const user = await User.findById(userId)
    if (!user) throw new UnauthenticatedError("User Not Found")

    //upload files to cloudinary
    const cloudinary_img_urls = await uploadAssetsImages(req)

    user.myAssests.push(...cloudinary_img_urls)
    await user.save()

    res.status(StatusCodes.OK).json({
        data: cloudinary_img_urls,
        success: true,
        msg: "Assets Uploaded Successfully",
    })
}

export {
    updateName,
    updateBio,
    updateImage,
    getAllAssests,
    uploadAssets
}
