import { useEffect, useState } from 'react'
import InputField from '../../../components/InputField';
import { getProfile, updateProfile } from '../../../services/profileApi';
import { useAuth } from '../../../context/AuthContext';

const PersonalDetails = ({ startEditing = false }) => {

    const [isEditing, setIsEditing] = useState(startEditing);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const { fetchCurrentUser } = useAuth();

    const [details, setDetails] = useState(
        {
            firstname: "",
            lastname: "",
            dob: "",
            gender: "",
            email: "",
            phone: "",
            emergencyNO: "",
            empId: "",
            address: "",
        }
    );

    const [jobdetails, setJobDetails] = useState(
        {
            designation: "",
            department: "",
            joiningdate: "",
            reportingmanager: "",
            workLocation: "",

        }
    );

    useEffect(() => {
        let active = true;
        getProfile()
            .then(({ data }) => {
                if (!active) return;
                const profile = data.user?.profile || {};
                const firstName = data.user?.firstName || data.user?.name?.split(' ')[0] || '';
                const lastName = data.user?.lastName || data.user?.name?.split(' ').slice(1).join(' ') || '';
                setDetails({
                    firstname: firstName,
                    lastname: lastName,
                    dob: profile.dob ? profile.dob.slice(0, 10) : '',
                    gender: profile.gender || '',
                    email: data.user?.email || '',
                    phone: profile.phone || data.user?.phone || '',
                    emergencyNO: profile.emergencyNo || '',
                    empId: profile.empId || '',
                    address: profile.address || '',
                });
                setJobDetails({
                    designation: profile.designation || '',
                    department: profile.department || '',
                    joiningdate: profile.joiningDate ? profile.joiningDate.slice(0, 10) : '',
                    reportingmanager: profile.reportingManager || '',
                    workLocation: profile.workLocation || '',
                });
            })
            .catch((error) => setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to load profile' }))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, []);

    //Onchange for Details
    const handleChange = (e) => {
        const { name, value } = e.target;

        setDetails((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    //onChange for Job Details
    const handleJobChange = (e) => {
        const { name, value } = e.target;

        setJobDetails((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await updateProfile({
                firstName: details.firstname,
                lastName: details.lastname,
                email: details.email,
                dob: details.dob || null,
                gender: details.gender,
                phone: details.phone,
                emergencyNo: details.emergencyNO,
                empId: details.empId,
                address: details.address,
                designation: jobdetails.designation,
                department: jobdetails.department,
                joiningDate: jobdetails.joiningdate || null,
                reportingManager: jobdetails.reportingmanager,
                workLocation: jobdetails.workLocation,
            });
            await fetchCurrentUser();
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };
    if (loading) return <div className="mt-8 bg-white rounded-lg p-6 text-gray-500">Loading profile...</div>;
    return (
        <div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Your section cards */}
                <div className=" flex flex-col gap-8 bg-white rounded-lg mt-8 p-1 col-span-2">
                    <div className="flex gap-4 justify-between items-center">
                        <h3 className="font-bold text-2xl"> Personal Information</h3>

                    </div>
                    <div className="flex ml-4 mr-4 gap-4 justify-between items-center font-semibold text-gray-500">
                        <InputField
                            label="First Name:"
                            name="firstname"
                            value={details.firstname}
                            placeholder="First Name"
                            onChange={handleChange}
                            disabled={isEditing ? false : true}
                        />
                        <InputField
                            label="Last Name:"
                            name="lastname"
                            value={details.lastname}
                            placeholder="Last Name"
                            onChange={handleChange}
                            disabled={isEditing ? false : true} />
                    </div>
                    <div className="flex  ml-4 mr-4 text-gray-500 gap-4 justify-between items-center font-semibold">
                        <InputField
                            label="Date of Birth:"
                            name="dob"
                            value={details.dob}
                            placeholder="Date of Birth"
                            type="date"
                            onChange={handleChange}
                            disabled={isEditing ? false : true} />
                        <InputField
                            label="Gender:"
                            name="gender"
                            value={details.gender}
                            placeholder="Gender"
                            onChange={handleChange}
                            className="w-[230px]"
                            type="select"
                            disabled={isEditing ? false : true}
                            options={[
                                { value: "male", label: "Male" },
                                { value: "female", label: "Female" },
                                { value: "others", label: "Others" },
                            ]}
                        />
                    </div>
                    <div className="flex ml-4 mr-4 text-gray-500 gap-4 justify-between items-center font-semibold">
                        <InputField
                            label="E Mail:"
                            name="email"
                            value={details.email}
                            placeholder="E Mail"
                            type="email"
                            onChange={handleChange}
                            disabled={isEditing ? false : true} />
                        <InputField
                            label="Phone NO:"
                            name="phone"
                            value={details.phone}
                            placeholder="Phone Number"
                            type='number'
                            onChange={handleChange} 
                            disabled={isEditing ? false : true}/>
                    </div>
                    <div className="flex gap-4 ml-4 mr-4 text-gray-500 justify-between items-center font-semibold">
                        <InputField
                            label="Emergency Contact:"
                            name="emergencyNO"
                            value={details.emergencyNO}
                            placeholder="Emergency Contact"
                            onChange={handleChange}
                            type="phone"
                            disabled={isEditing ? false : true} />
                        <InputField
                            label="Employee ID:"
                            name="empId"
                            value={details.empId}
                            placeholder="Employee ID"
                            onChange={handleChange}
                            disabled={isEditing ? false : true} />
                    </div>
                    <div className="m-4">
                        <InputField
                            label="Residential Address:"
                            name="address"
                            value={details.address}
                            placeholder="Residential Address"
                            onChange={handleChange}
                            type="textarea"
                            disabled={isEditing ? false : true} />
                    </div>

                </div>
                {/*JOB DETAILS*/}
                <div className="bg-white rounded-lg mt-8 p-6 flex flex-col gap-4 font-bold ">
                    <div className="flex justify-between items-center">
                        <h3>JOB DETAILS</h3>
                        <button className=" bg-blue-900 mt-2 mr-4 text-white font-semibold text-sm p-2 rounded-lg hover:scale-105 transition duration-300"
                            onClick={handleSubmit}
                            disabled={saving}>
                            {saving ? "Saving..." : isEditing ? "Save Info" : "Update Info"}
                        </button>
                    </div>
                    {message.text && <p className={message.type === 'error' ? 'text-red-600 text-sm' : 'text-green-600 text-sm'}>{message.text}</p>}
                    <div>
                        <InputField
                            label="Designation:"
                            name="designation"
                            value={jobdetails.designation}
                            placeholder="Designation"
                            onChange={handleJobChange}
                            disabled={isEditing ? false : true}
                        />
                    </div>
                    <div>
                        <InputField
                            label="Department:"
                            name="department"
                            value={jobdetails.department}
                            placeholder="Department"
                            onChange={handleJobChange}
                            disabled={isEditing ? false : true}
                        />
                    </div>
                    <div>
                        <InputField
                            label="Joining Date:"
                            name="joiningdate"
                            value={jobdetails.joiningdate}
                            placeholder="Joining Date"
                            type="date"
                            onChange={handleJobChange}
                            disabled={isEditing ? false : true}
                        />
                    </div>
                    <div>
                        <InputField
                            label="Reporting Manager:"
                            name="reportingmanager"
                            value={jobdetails.reportingmanager}
                            placeholder="Reporting Manager"
                            onChange={handleJobChange}
                            disabled={isEditing ? false : true}
                        />
                    </div>
                    <div>
                        <InputField
                            label="Work Location:"
                            name="workLocation"
                            value={jobdetails.workLocation}
                            placeholder="Work Location"
                            onChange={handleJobChange}
                            disabled={isEditing ? false : true}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default PersonalDetails