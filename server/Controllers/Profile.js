const User = require("../Models/User");
const Profile = require("../Models/Profile");
const Course = require("../Models/Course");
const { uploadImageTocloudinary } = require("../utils/imageuploader");

exports.deleteAccount = async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) {
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}
		await User.findByIdAndDelete(userId);
		return res.status(200).json({ success: true, message: "Account deleted" });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

exports.updateProfile = async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

		const { gender, DOB, about, contactNumber } = req.body;

		let profile = await Profile.findById(req.user.additionalDetails);
		if (!profile) {
			profile = await Profile.create({ gender, DOB, about, contactNumber });
			await User.findByIdAndUpdate(userId, { additionalDetails: profile._id }, { new: true });
		} else {
			if (gender !== undefined) profile.gender = gender;
			if (DOB !== undefined) profile.DOB = DOB;
			if (about !== undefined) profile.about = about;
			if (contactNumber !== undefined) profile.contactNumber = contactNumber;
			await profile.save();
		}

		return res.status(200).json({ success: true, message: "Profile updated", data: profile });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

exports.getAllUserDeatils = async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

		const user = await User.findById(userId).populate("additionalDetails").exec();
		if (!user) return res.status(404).json({ success: false, message: "User not found" });

		return res.status(200).json({ success: true, data: user });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

exports.getEnrolledCourses = async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

		// Attempt two common patterns: Course.StudentEnrolled may be an id or array
		const courses = await Course.find({ $or: [{ StudentEnrolled: userId }, { StudentEnrolled: { $in: [userId] } }] }).exec();
		return res.status(200).json({ success: true, data: courses });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

exports.updateDisplayPicture = async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
		if (!req.files || !req.files.image) {
			return res.status(400).json({ success: false, message: "No image provided" });
		}
		const image = req.files.image;
		const uploadResult = await uploadImageTocloudinary(image, process.env.FOLDER_NAME || "profiles");
		await User.findByIdAndUpdate(userId, { image: uploadResult.secure_url }, { new: true });
		return res.status(200).json({ success: true, message: "Display picture updated", url: uploadResult.secure_url });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

