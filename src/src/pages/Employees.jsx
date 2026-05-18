import {
  useState,
  useEffect,
} from 'react';

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';

import { db } from '../lib/firebase';

import {
  Pencil,
  Trash2,
  X,
  Save,
} from 'lucide-react';

export default function Employees() {

  const [employees, setEmployees] =
    useState([]);

  const [editingEmployee, setEditingEmployee] =
    useState(null);

  const [editData, setEditData] =
    useState({

      name: '',

      email: '',

      password: '',

      phone: '',

      role: '',

    });

  // FETCH EMPLOYEES

  useEffect(() => {

    const unsubscribe =
      onSnapshot(

        collection(db, 'employees'),

        (snapshot) => {

          const employeeList = [];

          snapshot.forEach((docItem) => {

            employeeList.push({

              id: docItem.id,

              ...docItem.data(),

            });

          });

          setEmployees(employeeList);

        }

      );

    return () => unsubscribe();

  }, []);

  // DELETE EMPLOYEE

  const deleteEmployee =
    async (id) => {

      const confirmDelete =
        window.confirm(
          'Delete this employee?'
        );

      if (!confirmDelete) return;

      try {

        await deleteDoc(
          doc(
            db,
            'employees',
            id
          )
        );

        await deleteDoc(
          doc(
            db,
            'users',
            id
          )
        );

        alert(
          'Employee Deleted Successfully'
        );

      } catch (error) {

        console.log(error);

        alert(error.message);

      }

    };

  // OPEN EDIT

  const openEdit = (employee) => {

    setEditingEmployee(
      employee.id
    );

    setEditData({

      name:
        employee.name || '',

      email:
        employee.email || '',

      password:
        employee.password || '',

      phone:
        employee.phone || '',

      role:
        employee.role || '',

    });

  };

  // HANDLE CHANGE

  const handleEditChange =
    (e) => {

      setEditData({

        ...editData,

        [e.target.name]:
          e.target.value,

      });

    };

  // SAVE EDIT

  const saveEdit =
    async (id) => {

      try {

        // UPDATE EMPLOYEE

        await updateDoc(

          doc(
            db,
            'employees',
            id
          ),

          {

            name:
              editData.name,

            email:
              editData.email,

            password:
              editData.password,

            phone:
              editData.phone,

            role:
              editData.role,

          }

        );

        // UPDATE USERS

        await setDoc(

          doc(
            db,
            'users',
            id
          ),

          {

            displayName:
              editData.name,

            email:
              editData.email,

            role:
              editData.role,

          },

          { merge: true }

        );

        setEditingEmployee(
          null
        );

        alert(
          'Employee Updated Successfully'
        );

      } catch (error) {

        console.log(error);

        alert(error.message);

      }

    };

  return (

    <div className="p-8 min-h-screen bg-[#0b0b14] text-white">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-bold">

              Employees

            </h1>

            <p className="text-gray-400 mt-2">

              Manage employee details

            </p>

          </div>

          <div className="px-5 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">

            Total:
            {' '}
            {employees.length}

          </div>

        </div>

        {/* LIST */}

        <div className="grid md:grid-cols-2 gap-6">

          {employees.map((employee) => (

            <div
              key={employee.id}
              className="bg-white/5 border border-white/10 rounded-3xl p-6"
            >

              {editingEmployee ===
              employee.id ? (

                <div className="space-y-4">

                  {/* NAME */}

                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={
                      handleEditChange
                    }
                    placeholder="Name"
                    className="w-full bg-[#151521] border border-white/10 rounded-2xl p-4 outline-none"
                  />

                  {/* EMAIL */}

                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={
                      handleEditChange
                    }
                    placeholder="Email"
                    className="w-full bg-[#151521] border border-white/10 rounded-2xl p-4 outline-none"
                  />

                  {/* PASSWORD */}

                  <input
                    type="text"
                    name="password"
                    value={editData.password}
                    onChange={
                      handleEditChange
                    }
                    placeholder="Password"
                    className="w-full bg-[#151521] border border-white/10 rounded-2xl p-4 outline-none"
                  />

                  {/* PHONE */}

                  <input
                    type="text"
                    name="phone"
                    value={editData.phone}
                    onChange={
                      handleEditChange
                    }
                    placeholder="Phone"
                    className="w-full bg-[#151521] border border-white/10 rounded-2xl p-4 outline-none"
                  />

                  {/* ROLE */}

                  <select
                    name="role"
                    value={editData.role}
                    onChange={
                      handleEditChange
                    }
                    className="w-full bg-[#151521] border border-white/10 rounded-2xl p-4 outline-none"
                  >

                    <option value="Employee">

                      Employee

                    </option>

                    <option value="Manager">

                      Manager

                    </option>

                    <option value="Admin">

                      Admin

                    </option>

                  </select>

                  {/* BUTTONS */}

                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        saveEdit(
                          employee.id
                        )
                      }
                      className="flex-1 py-3 rounded-2xl bg-green-600 flex items-center justify-center gap-2 font-semibold"
                    >

                      <Save size={18} />

                      Save

                    </button>

                    <button
                      onClick={() =>
                        setEditingEmployee(
                          null
                        )
                      }
                      className="flex-1 py-3 rounded-2xl bg-red-600 flex items-center justify-center gap-2 font-semibold"
                    >

                      <X size={18} />

                      Cancel

                    </button>

                  </div>

                </div>

              ) : (

                <>

                  {/* INFO */}

                  <h2 className="text-2xl font-bold">

                    {employee.name}

                  </h2>

                  <p className="text-gray-400 mt-3">

                    {employee.email}

                  </p>

                  <p className="text-gray-400">

                    Password:
                    {' '}
                    {employee.password ||
                      'Not Available'}

                  </p>

                  <p className="text-gray-400">

                    {employee.phone ||
                      'No phone number'}

                  </p>

                  {/* ROLE */}

                  <div className="mt-5">

                    <span className="px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400 text-sm">

                      {employee.role}

                    </span>

                  </div>

                  {/* UID */}

                  <div className="mt-4 text-xs text-gray-600 break-all">

                    UID:
                    {' '}
                    {employee.uid}

                  </div>

                  {/* BUTTONS */}

                  <div className="flex gap-3 mt-6">

                    <button
                      onClick={() =>
                        openEdit(
                          employee
                        )
                      }
                      className="flex-1 py-3 rounded-2xl bg-blue-600/20 border border-blue-500/20 text-blue-400 flex items-center justify-center gap-2 hover:bg-blue-600/30 transition-all"
                    >

                      <Pencil size={18} />

                      Edit

                    </button>

                    <button
                      onClick={() =>
                        deleteEmployee(
                          employee.id
                        )
                      }
                      className="flex-1 py-3 rounded-2xl bg-red-600/20 border border-red-500/20 text-red-400 flex items-center justify-center gap-2 hover:bg-red-600/30 transition-all"
                    >

                      <Trash2 size={18} />

                      Delete

                    </button>

                  </div>

                </>

              )}

            </div>

          ))}

        </div>

        {/* EMPTY */}

        {employees.length === 0 && (

          <div className="text-center py-20 text-gray-500">

            No employees found

          </div>

        )}

      </div>

    </div>

  );

}