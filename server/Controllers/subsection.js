// import necessary modules
const Section = require("../Models/Section");
const SubSection = require("../Models/SubSection");
const { uploadImageTocloudinary } = require("../utils/imageuploader");

exports.createSubsection = async (req, res) => {
    try {
        const { sectionId, title, description } = req.body;
        const video = req.files && req.files.video;
        if (!sectionId || !title || !description || !video) {
            return res.status(400).json({ success: false, message: "all fields are required" });
        }

        const uploadDetails = await uploadImageTocloudinary(video, process.env.FOLDER_NAME || "subsections");

        const newSub = await SubSection.create({
            title,
            description,
            videoUrl: uploadDetails.secure_url,
            timeduration: uploadDetails.duration || "",
        });

        const section = await Section.findById(sectionId);
        if (!section) return res.status(404).json({ success: false, message: "Section not found" });

        if (!section.subSection) {
            section.subSection = newSub._id;
        } else if (Array.isArray(section.subSection)) {
            section.subSection.push(newSub._id);
        } else {
            section.subSection = [section.subSection, newSub._id];
        }

        await section.save();

        return res.status(200).json({ success: true, message: "Subsection created", data: newSub });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSubsection = async (req, res) => {
    try {
        const { subsectionId, title, description } = req.body;
        if (!subsectionId) return res.status(400).json({ success: false, message: "subsectionId required" });

        const subsection = await SubSection.findById(subsectionId);
        if (!subsection) return res.status(404).json({ success: false, message: "Subsection not found" });

        if (title !== undefined) subsection.title = title;
        if (description !== undefined) subsection.description = description;

        if (req.files && req.files.video) {
            const uploadDetails = await uploadImageTocloudinary(req.files.video, process.env.FOLDER_NAME || "subsections");
            subsection.videoUrl = uploadDetails.secure_url;
            subsection.timeduration = uploadDetails.duration || subsection.timeduration;
        }

        await subsection.save();
        return res.status(200).json({ success: true, message: "Subsection updated", data: subsection });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteSubsection = async (req, res) => {
    try {
        const { subsectionId, sectionId } = req.body;
        if (!subsectionId) return res.status(400).json({ success: false, message: "subsectionId required" });

        // remove reference from section
        if (sectionId) {
            await Section.findByIdAndUpdate(
                { _id: sectionId },
                { $pull: { subSection: subsectionId } },
                { new: true }
            );
        }

        const subsection = await SubSection.findByIdAndDelete(subsectionId);
        if (!subsection) return res.status(404).json({ success: false, message: "subsection not found" });

        return res.status(200).json({ success: true, message: "Subsection deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "An error occured while deleting the Subsection" });
    }
};