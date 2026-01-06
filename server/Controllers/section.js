const Section = require("../Models/Section");
const SubSection = require("../Models/SubSection");
const Course = require("../Models/Course");

exports.createSection = async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

		const { courseId, sectionName } = req.body;
		if (!courseId || !sectionName) {
			return res.status(400).json({ success: false, message: "courseId and sectionName are required" });
		}

		const course = await Course.findById(courseId);
		if (!course) return res.status(404).json({ success: false, message: "Course not found" });

		const section = await Section.create({ sectionName });

		// Course.CourseContent might be a single ObjectId or an array; handle both
		if (!course.CourseContent) {
			course.CourseContent = section._id;
		} else if (Array.isArray(course.CourseContent)) {
			course.CourseContent.push(section._id);
		} else {
			// convert to array if already a single id
			course.CourseContent = [course.CourseContent, section._id];
		}
		await course.save();

		return res.status(200).json({ success: true, message: "Section created", data: section });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

exports.updateSection = async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

		const { sectionId, sectionName } = req.body;
		if (!sectionId) return res.status(400).json({ success: false, message: "sectionId required" });

		const section = await Section.findById(sectionId);
		if (!section) return res.status(404).json({ success: false, message: "Section not found" });

		if (sectionName !== undefined) section.sectionName = sectionName;
		await section.save();

		return res.status(200).json({ success: true, message: "Section updated", data: section });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

exports.deleteSection = async (req, res) => {
	try {
		const userId = req.user && req.user.id;
		if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

		const { sectionId, courseId } = req.body;
		if (!sectionId) return res.status(400).json({ success: false, message: "sectionId required" });

		// remove section document
		const section = await Section.findByIdAndDelete(sectionId);
		if (!section) return res.status(404).json({ success: false, message: "Section not found" });

		// remove any referenced subsections
		const subs = section.subSection;
		if (subs) {
			if (Array.isArray(subs)) {
				await SubSection.deleteMany({ _id: { $in: subs } });
			} else {
				await SubSection.findByIdAndDelete(subs);
			}
		}

		// remove reference from course if provided
		if (courseId) {
			const course = await Course.findById(courseId);
			if (course && course.CourseContent) {
				if (Array.isArray(course.CourseContent)) {
					course.CourseContent = course.CourseContent.filter((id) => id.toString() !== sectionId);
				} else if (course.CourseContent.toString() === sectionId) {
					course.CourseContent = undefined;
				}
				await course.save();
			}
		}

		return res.status(200).json({ success: true, message: "Section deleted" });
	} catch (error) {
		return res.status(500).json({ success: false, message: error.message });
	}
};

