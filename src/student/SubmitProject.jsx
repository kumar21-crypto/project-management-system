import React, { useState, useEffect, useRef, useContext } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { client, databases, database_id, ID, account, storage } from "../lib/appwrite";
import { UserContext } from "../context/contextApi";
import Uploading from "../animations/Uploading.json"
import Success from "../animations/Success.json"
import Lottie from "lottie-react";
import { FaReact, FaAngular, FaVuejs, FaNodeJs, FaPython, FaGithub, FaNpm, FaSwift } from "react-icons/fa";
import {
  SiDjango, SiTailwindcss, SiFirebase, SiAppwrite, SiTensorflow, SiPytorch, SiScikitlearn, SiKeras,
  SiOpencv, SiJupyter, SiGooglecolab, SiFigma, SiAdobexd, SiSketch, SiInvision, SiFramer, SiZelle,
  SiCanva, SiTableau, SiPowers, SiFlutter,
  SiKotlin,
  SiAndroidstudio
} from "react-icons/si";
import { TbBrandReactNative } from "react-icons/tb";
import { img, source } from "motion/react-m";
import { APPWRITE_CONFIG } from "../lib/appwriteConfig";

const SubmitProject = () => {
  // project data
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
const attachmentInputRef = useRef(null);
  const [fileNames, setFileNames] = useState([]);
  const [newTeamMember, setNewTeamMember] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [selectedTechnologies, setSelectedTechnologies] = useState([]);
  const [projectHeads, SetProjectHeads] = useState([])

  const { user, fetchProjects, uploadProject, projects } =
    useContext(UserContext);
  const [loading, setLoading] = useState(false);

  const [projectData, setProjectData] = useState({
    title: "",
    category: "Web Development",
    head: "",
    teamMembers: [],
    dueDate: "",
    githubLink: "",
    description: "",
    attachments: [],
    hodStatus: 'not approved',
    proheadStatus: 'not approved',
    hodComment: 'no comments',
    proheadComment: 'no comment',
    uploadBy: user.$id,
    images: [],
  });

  // technology icons
  const technologyIcons = {
    React: <FaReact className="text-blue-500" />,
    Angular: <FaAngular className="text-red-500" />,
    Vue: <FaVuejs className="text-green-500" />,
    "Node.js": <FaNodeJs className="text-green-600" />,
    Django: <SiDjango className="text-green-700" />,
    TailwindCSS: <SiTailwindcss className="text-blue-400" />,
    Bootstrap: <FaReact className="text-purple-500" />,
    Firebase: <img className="h-5 w-5" src="https://img.icons8.com/?size=100&id=62452&format=png&color=000000" />,
    Appwrite: <SiAppwrite className="text-pink-500" />,
    GitHub: <FaGithub className="text-gray-500" />,
    NPM: <FaNpm className="text-red-600" />,
    TensorFlow: <SiTensorflow className="text-orange-500" />,
    PyTorch: <SiPytorch className="text-red-500" />,
    "Scikit-learn": <SiScikitlearn className="text-blue-500" />,
    Keras: <SiKeras className="text-red-400" />,
    OpenCV: <SiOpencv className="text-blue-600" />,
    "Jupyter Notebook": <SiJupyter className="text-orange-400" />,
    "Google Colab": <SiGooglecolab className="text-yellow-400" />,
    Figma: <SiFigma className="text-purple-400" />,
    "Adobe XD": <SiAdobexd className="text-pink-400" />,
    Sketch: <SiSketch className="text-yellow-400" />,
    InVision: <SiInvision className="text-purple-500" />,
    Framer: <SiFramer className="text-blue-500" />,
    Canva: <SiCanva className="text-blue-400" />,
    Zeplin: <SiZelle className="text-yellow-500" />,
    Tableau: <SiTableau className="text-blue-500" />,
    "Power BI": <SiPowers className="text-yellow-500" />,
    "React Native": <TbBrandReactNative className="text-blue-400" />,
    "Flutter": <SiFlutter className="text-blue-400" />,
    Swift: <FaSwift className="text-orange-400" />,
    Kotlin: <SiKotlin className="text-purple-700  text-sm" />,
    // "Android Studio": <SiAndroidstudio className="text-blue-700" />,
    "Android Studio": <img className="h-5 w-5" src="https://img.icons8.com/?size=100&id=04OFrkjznvcd&format=png&color=000000" />,
    Pandas: <img className="h-5 w-5" src="https://img.icons8.com/?size=100&id=xSkewUSqtErH&format=png&color=000000" />,
    NumPy: <img className="h-5 w-5" src="https://img.icons8.com/?size=100&id=aR9CXyMagKIS&format=png&color=000000" />,
    Matplotlib: <img className="h-5 w-5" src="https://img.icons8.com/?size=100&id=AuUafKkHkYAO&format=png&color=000000" />,


  };

  const clearForm = () => {
    setProjectData({
      title: "",
      category: "Web Development",
      head: "",
      teamMembers: [],
      dueDate: "",
      githubLink: "",
      description: "",
      attachments: [],
      hodStatus: "not approved",
      proheadStatus: "not approved",
      hodComment: "no comments",
      proheadComment: "no comment",
      uploadBy: user.$id,
      images: [],
    });
    setSelectedTechnologies([]); // Clear selected technologies
    setFileNames([]); // Clear file names
    setNewTeamMember(""); // Clear the team member input
  };

  // Fetch registered HODs
  const fetchProjectHeads = async () => {
    try {
      const response = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.PROJECT_HEAD // Replace with your HODs collection ID
      );
      if (response) {
        SetProjectHeads(response.documents); // Store HODs in state
      } else {
        SetProjectHeads(null)
      }

    } catch (error) {
      console.error("Failed to fetch HODs:", error);
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setProjectData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // for image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProjectData((prevData) => ({
      ...prevData,
      images: files,
    }));
  };

  // handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate file size (max 10MB)
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024); // 10MB in bytes
    const invalidFiles = files.filter((file) => file.size > 10 * 1024 * 1024);

    if (invalidFiles.length > 0) {
      toast.error("Some files exceed the 10MB size limit and were not added.");
    }

    setProjectData((prevData) => ({
      ...prevData,
      attachments: validFiles,
    }));

    setFileNames(validFiles.map((file) => file.name));
  };



  const handleAddTeamMember = () => {
    if (newTeamMember.trim() !== "") {
      setProjectData((prevData) => ({
        ...prevData,
        teamMembers: [...prevData.teamMembers, newTeamMember],
      }));
      setNewTeamMember(""); // Clear the input field
    }
  };

  const handleRemoveTeamMember = (index) => {
    setProjectData((prevData) => ({
      ...prevData,
      teamMembers: prevData.teamMembers.filter((_, i) => i !== index),
    }));
  };

  // project submit function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploadStatus("uploading");
    setLoading(true);

    try {
      const updatedProjectData = {
        ...projectData,
        technologies: selectedTechnologies, // Add selected technologies to project data
      };

      await uploadProject(user.$id, updatedProjectData);
      setUploadStatus("success");

      // hide the success animation
      setTimeout(() => {
        setUploadStatus("idle")
        clearForm(); // for clear form
      }, 2000)

    } catch (error) {
      console.error("Failed to submit project:", error);
      setUploadStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  // select project technologies
  const categoryTechnologies = {
    "Web Development": [
      "React",
      "Angular",
      "Vue",
      "Node.js",
      "Django",
      "TailwindCSS",
      "Bootstrap",
      "Firebase",
      "Appwrite",
      "GitHub",
      "NPM",
    ],
    "Mobile App": [
      "React Native",
      "Flutter",
      "Swift",
      "Kotlin",
      "Ionic",
      "Firebase",
      "Appwrite",
      "Expo",
      "Android Studio",
    ],
    "Machine Learning": [
      "TensorFlow",
      "PyTorch",
      "Scikit-learn",
      "Keras",
      "OpenCV",
      "Jupyter Notebook",
      "Google Colab",
      "Pandas",
      "NumPy",
    ],
    "UI/UX Design": [
      "Figma",
      "Adobe XD",
      "Sketch",
      "InVision",
      "Framer",
      "Canva",
      "Zeplin",
    ],
    "Data Science": [
      "Pandas",
      "NumPy",
      "Matplotlib",
      "Seaborn",
      "Jupyter Notebook",
      "Google Colab",
      "Tableau",
      "Power BI",
    ],
  };

  const Savedraft = () => {
    console.log("selected techs are ", selectedTechnologies)
  }

  useEffect(() => {
    // Reset selected technologies when category changes
    setSelectedTechnologies([]);
  }, [projectData.category]);

  useEffect(() => {
    fetchProjectHeads();
  }, [])



  return (
    <div className="flex justify-center p-1 mb-15">
      <ToastContainer />
      <main className="p-8 flex justify-center bg-gray-800 w-5/7 rounded-xl mr-2">
        <div className="max-w-4xl w-full">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Submit New Project</h1>
            <p className="text-gray-400 mt-2">
              Fill in the project details below to submit your project
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="bg-gray-800 p-6 rounded-lg space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={projectData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-lg"
                  placeholder="Enter project title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Category
                </label>
                <select
                  name="category"
                  value={projectData.category}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-lg"
                >
                  <option>Web Development</option>
                  <option>Mobile App</option>
                  <option>Machine Learning</option>
                  <option>UI/UX Design</option>
                  <option>Data Science</option>
                </select>
              </div>

              <div>
                <label className="block text-sm  font-medium mb-2">Technologies Used</label>
                <div className="flex flex-wrap gap-4 bg-gray-700 p-4 rounded-lg ">
                  {categoryTechnologies[projectData.category]?.map((tech, index) => (

                    <div key={index} className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg shadow hover:bg-gray-600 transition duration-200">
                      <input
                        type="checkbox"
                        id={`tech-${index}`}
                        value={tech}
                        checked={selectedTechnologies.includes(tech)}
                        onChange={(e) => {
                          const { value, checked } = e.target;
                          setSelectedTechnologies((prev) =>
                            checked ? [...prev, value] : prev.filter((t) => t !== value)
                          );
                        }}
                        className="form-checkbox h-5 w-5 text-blue-600"
                      />
                      <label htmlFor={`tech-${index}`} className="text-sm flex items-center text-gray-300 cursor-pointer">
                        <span className="font-medium">{tech}</span>
                        <span className="text-lg ml-1">{technologyIcons[tech]}</span>
                      </label>
                    </div>
                  ))}
                </div> </div>

              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Project Head
                </label>
                <select
                  name="head"
                  value={projectData.head}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-lg"
                >
                  <option>Select Project Head</option>

                  {projectHeads.map((hod) => (
                    <option key={hod.$id} value={hod.Name}>
                      {hod.Name} - {hod.Department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Team Members
                </label>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      name="teamMember"
                      value={newTeamMember}
                      onChange={(e) => setNewTeamMember(e.target.value)}
                      className="flex-1 bg-gray-700 border-gray-600 text-white rounded-lg"
                      placeholder="Enter team member name"
                    />
                    <button
                      type="button"
                      onClick={handleAddTeamMember}
                      className="px-4 py-2 bg-custom text-white rounded-lg"
                    >
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  {projectData.teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-700 px-3 py-2 rounded-lg"
                    >
                      <span className="flex-1">{member}</span>
                      <button
                        type="button"
                        className="text-red-400"
                        onClick={() => handleRemoveTeamMember(index)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={projectData.dueDate}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  GitHub Repository Link
                </label>
                <input
                  type="url"
                  name="githubLink"
                  value={projectData.githubLink}
                  onChange={handleChange}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-lg"
                  placeholder="Enter GitHub repository URL"
                  pattern="https://github.com/.*"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Project Description
                </label>
                <textarea
                  name="description"
                  value={projectData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-lg"
                  placeholder="Enter project description"
                ></textarea>
              </div>

             {/* for project image */}
<div>
  <label className="block text-sm font-medium mb-2">Project Images</label>
  <div className="text-center">
    <button
      type="button"
      className="mt-2 px-4 py-2 bg-blue-700 text-white rounded-lg"
      onClick={() => imageInputRef.current.click()} // Use a separate ref for images
    >
      Browse Images
    </button>
    <input
      type="file"
      name="images"
      accept="image/*" // Restrict file selection to images only
      multiple
      className="hidden"
      ref={imageInputRef} // Separate ref for image input
      onChange={(e) => {
        const files = Array.from(e.target.files);

        // Validate file size (max 5MB per image)
        const validFiles = files.filter((file) => file.size <= 5 * 1024 * 1024);
        const invalidFiles = files.filter((file) => file.size > 5 * 1024 * 1024);

        if (invalidFiles.length > 0) {
          toast.error("Some images exceed the 5MB size limit and were not added.");
        }

        setProjectData((prevData) => ({
          ...prevData,
          images: [...prevData.images, ...validFiles],
        }));
      }}
    />
    <p className="mt-2 text-sm text-gray-500">
      Supported formats: JPG, PNG, GIF (Max 5MB per image)
    </p>

    {/* Display selected images */}
    {projectData.images.length > 0 && (
      <div className="mt-4 grid grid-cols-4 gap-4">
        {projectData.images.map((image, index) => (
          <div
            key={index}
            className="relative border border-gray-600 rounded-lg p-2 bg-gray-700"
          >
            <img
              src={URL.createObjectURL(image)}
              alt={`Preview ${index + 1}`}
              className="w-full h-24 object-cover rounded-md"
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-1"
              onClick={() => {
                setProjectData((prevData) => ({
                  ...prevData,
                  images: prevData.images.filter((_, i) => i !== index),
                }));
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

{/* for project files */}
<div>
  <label className="block text-sm font-medium mb-2">
    Attachments
  </label>
  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
    <button
      type="button"
      className="mt-2 px-4 py-2 bg-custom text-white bg-green-600 rounded-lg"
      onClick={() => attachmentInputRef.current.click()} // Use a separate ref for attachments
    >
      Browse Files
    </button>
    <input
      type="file"
      ref={attachmentInputRef} // Separate ref for attachment input
      name="attachments"
      className="hidden"
      multiple
      accept=".pdf, .ppt, .doc, .docx, .zip"
      onChange={handleFileChange}
    />
    <p className="mt-2 text-sm text-gray-500">
      Supported formats: PDF, PPT, DOC, DOCX, ZIP (Max 10MB)
    </p>
    {/* Display selected files */}
    {projectData.attachments.length > 0 && (
      <div className="mt-4 grid grid-cols-3 gap-4">
        {projectData.attachments.map((file, index) => (
          <div
            key={index}
            className="relative border border-gray-600 rounded-lg p-2 bg-gray-700"
          >
            {/* File preview */}
            {file.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-md"
              />
            ) : file.type === "application/pdf" ? (
              <embed
                src={URL.createObjectURL(file)}
                type="application/pdf"
                className="w-full h-24 rounded-md"
              />
            ) : (
              <div className="flex items-center justify-center h-24 text-white">
                <i className="fas fa-file-alt text-4xl"></i>
                <p className="text-sm truncate ml-2">{file.name}</p>
              </div>
            )}

            {/* Remove button */}
            <button
              type="button"
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              onClick={() => {
                setProjectData((prevData) => ({
                  ...prevData,
                  attachments: prevData.attachments.filter((_, i) => i !== index),
                }));
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
</div>

            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={clearForm}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg"
              >
                Clear Form
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg"
                onClick={Savedraft}
              >
                Save Draft
              </button>

              <button
                onClick={handleSubmit}
                type="submit"
                className="px-6 py-2 bg-custom text-white rounded-lg bg-green-600"
              >
                Submit Project
              </button>
            </div>
          </form>
        </div>
      </main>

      <aside className="bg-gray-800 h-full p-6 w-2/7 rounded-xl overflow-y-auto ml-5">
        <h2 className="text-xl font-bold mb-4">Submission Guidelines</h2>
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Project Requirements</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Project title must be unique</li>
              <li>Detailed description required (min. 200 characters)</li>
              <li>At least one team member required</li>
              <li>Due date must be in the future</li>
            </ul>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium mb-2">File Requirements</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Maximum file size: 10MB per file</li>
              <li>Allowed formats: PDF, DOC, DOCX, ZIP</li>
              <li>Maximum 5 files per submission</li>
            </ul>
          </div>
          <div className="bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Team Guidelines</h3>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>Maximum 5 team members</li>
              <li>Each member must have a valid name</li>
              <li>No duplicate team members allowed</li>
            </ul>
          </div>
        </div>
      </aside>

      {/* overlay for uploading animation */}
      {uploadStatus === "uploading" &&

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">

            <svg
              className="animate-spin h-10 w-10 text-blue-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
            <p className="text-lg font-medium text-gray-700">Uploading...</p>
          </div>
        </div>

      }

      {uploadStatus === "success" &&

        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">

            <svg
              className="h-10 w-10 text-green-500 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-lg font-medium text-gray-700">Uploaded Successfully!</p>
          </div>
        </div>

      }
    </div>
  );
};

export default SubmitProject;