import { useState } from "react";
const ONE_DAY_IN_MS = 7*24 * 60 * 60 * 1000;
 export async function submitscore(key , value){

  const existingData =JSON.parse(localStorage.getItem(key)) || {
      data: [],
      expiry: Date.now() + ONE_DAY_IN_MS,
    };
  if (Date.now() > existingData.expiry) {
    localStorage.removeItem(key);

    existingData.data = [];
    existingData.expiry = Date.now() + ONE_DAY_IN_MS;
  }
  
  const updatedData = [...existingData.data, value];
  const storescore = {data: updatedData,expiry: Date.now() + ONE_DAY_IN_MS,};
  localStorage.setItem(key,JSON.stringify( storescore));
  return updatedData;


}
export const getscore = (key) => {
  const data = JSON.parse(localStorage.getItem(key));

  if (!data) return [];

  if (Date.now() > data.expiry) {
    localStorage.removeItem(key);
    return [];
  }

  return data.data;
};









