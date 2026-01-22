import React from "react";

const page = () => {
  return (
    <div className="grid justify-center">
      <div className="pt-15 text-3xl  flex justify-center p-10">Profile</div>
      <div className="grid justify-center gap-3 text-xl">
        <div className="flex justify-between bg-gray-100 p-4 rounded-xl   w-85 ">
          <div className=" ">Name</div>
          <div className="text-gray-500">name</div>
        </div>
        <div className="flex justify-between bg-gray-100 p-4 rounded-xl   w-85 ">
          <div className=" ">Gmail</div>
          <div className="text-gray-500">gmail</div>
        </div>
        <div className="flex justify-between bg-gray-100 p-4 rounded-xl  w-85 ">
          <div className="">Gender</div>
          <div className="text-gray-500">gender</div>
        </div>
        <div className="flex justify-between bg-gray-100 p-4 rounded-xl  w-85 ">
          <div className="">Age</div>
          <div className="text-gray-500">age</div>
        </div>
        <div className="flex justify-between bg-gray-100 p-4 rounded-xl  w-85 ">
          <div className="">Weight</div>
        <div className="text-gray-500">weight {''}</div>

        </div>
        <div className="flex justify-between bg-gray-100 p-4 rounded-xl  w-85 ">
          <div className="">Height</div>
          <div className="text-gray-500">height</div>
        </div>
      </div>
    </div>
  );
};

export default page;
