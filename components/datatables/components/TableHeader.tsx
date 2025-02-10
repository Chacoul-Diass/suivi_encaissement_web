import React from 'react';
import { DataTableSortStatus } from 'mantine-datatable';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';

interface TableHeaderProps {
  hideCols: string[];
  showHideColumns: (col: string) => void;
  setSortStatus: (status: DataTableSortStatus) => void;
  encaissementText: string;
  totalUnvalidatedRecords: number;
}

const TableHeader: React.FC<TableHeaderProps> = ({
  hideCols,
  showHideColumns,
  setSortStatus,
  encaissementText,
  totalUnvalidatedRecords,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-xl">
        {totalUnvalidatedRecords} {encaissementText}
      </h2>
      <div className="flex w-full flex-wrap items-center justify-between gap-4 sm:w-auto">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <Dropdown
              btnClassName="!flex items-center border font-semibold border-[#e0e6ed] dark:border-[#253b5c] rounded-md px-4 py-2 text-sm dark:bg-[#1b2e4b] dark:text-white-dark"
              button={
                <>
                  <span className="ltr:mr-1 rtl:ml-1">Colonnes</span>
                  <IconCaretDown className="h-5 w-5" />
                </>
              }
            >
              <ul className="!min-w-[150px]">
                {[
                  'DR',
                  'EXP',
                  'Produit',
                  'Date Encais',
                  'Montant caisse (A)',
                  'Montant bordereau (B)',
                  'Montant revelé (C)',
                  'Date cloture',
                  'Bordereau',
                  'caisse',
                ].map((col) => (
                  <li key={col}>
                    <button
                      type="button"
                      className={`w-full ${
                        hideCols.includes(col)
                          ? 'bg-primary/10 text-primary'
                          : ''
                      }`}
                      onClick={() => showHideColumns(col)}
                    >
                      {col}
                    </button>
                  </li>
                ))}
              </ul>
            </Dropdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableHeader;
