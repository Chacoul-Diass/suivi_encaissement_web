"use client";

import Filtre from "@/components/filtre/Filtre";
import React from "react";
import { Tab } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import IconTag from "@/components/icon/icon-tag";
import IconDollarSignCircle from "@/components/icon/icon-dollar-sign-circle";
import Table from "./table";
import Timbre from "../timbre/TableTimbre";

const Saphir = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-6 ml-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <Filtre />
      </div>

      <div className="panel">
        {isMounted && (
          <Tab.Group>
            <Tab.List className="flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`${selected
                      ? "text-primary !outline-none before:!w-full"
                      : ""
                      } relative -mb-[1px] flex items-center px-4 py-2.5 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:inline-block before:h-[1px] before:w-0 before:bg-primary before:transition-all before:duration-700 hover:text-primary hover:before:w-full`}
                  >
                    <IconDollarSignCircle className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                    <span className="text-sm font-medium">Encaissements Saphir-Jade Saphir-Smart</span>
                  </button>
                )}
              </Tab>
              <Tab as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`${selected
                      ? "text-primary !outline-none before:!w-full"
                      : ""
                      } relative -mb-[1px] flex items-center px-4 py-2.5 before:absolute before:bottom-0 before:left-0 before:right-0 before:m-auto before:inline-block before:h-[1px] before:w-0 before:bg-primary before:transition-all before:duration-700 hover:text-primary hover:before:w-full`}
                  >
                    <IconTag className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                    <span className="text-sm font-medium">Encaissements Timbres</span>
                  </button>
                )}
              </Tab>
            </Tab.List>
            <Tab.Panels>
              <Tab.Panel>
                <div className="mt-4">
                  <Table />
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="mt-4">
                  <Timbre />
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        )}
      </div>
    </div>
  );
};

export default Saphir;
