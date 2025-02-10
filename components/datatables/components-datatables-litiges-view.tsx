import React, { useState } from "react";

const DatatablesLitigesView = (data: any) => {
  // Types des états
  const [observationEcart1, setObservationEcart1] = useState<string>("");

  const [montantBanque, setMontantBanque] = useState<number>(2500000);
  const [ras1, setRas1] = useState<boolean>(false);
  const [ras2, setRas2] = useState<boolean>(false);

  // Fonction pour gérer le passage en litige
  const handleLitige = (): void => {
    alert("Passage en litige !");
  };

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-1 flex items-center justify-center text-xl font-bold">
        Formulaire de visualisation
      </h2>
      <p className="mb-6 flex items-center justify-center text-gray-500">
        Vous permet de voir vos encaissements terminés.
      </p>

      {/* <button
				onClick={handleLitige}
				className="mb-6 w-full rounded-md bg-red-500 py-2 text-white hover:bg-red-600"
			>
				Passer en litige
			</button> */}

      {/* Détails des montants */}
      <div className="mb-6 rounded-lg bg-[#afb7c2] p-4 text-white  shadow-lg ">
        <h3 className="mb-2 ">
          Journée du 23/09/2024{" "}
          <p className="text-sm text-gray-100 opacity-80">
            Détail des montants.
          </p>
        </h3>
        <div className="mb-4 flex w-full ">
          <p className="w-full items-start justify-start ">
            Montant Caisses: <p className="">25 000 000 F CFA</p>
          </p>
          <p className=" w-full items-center justify-center ">
            Montant Bordereaux: <p className="">2 500 000 F CFA</p>
          </p>
          <p className="w-full items-end justify-end ">
            Écart 1: <p className=" text-green-600">22 500 000 F CFA</p>
          </p>
        </div>
      </div>
      <div className="mb-4 rounded-lg border  p-4 shadow-lg ">
        <h4 className="text-lg text-[#FD8213]">Observation</h4>

        <div className="mb-10 flex w-full font-black text-gray-500">
          <p className="w-9/12 items-start justify-start">
            Observation sur l'écart entre les montants de la caisse et du
            bordereau
          </p>
          <div className="mr-2 flex w-3/12 items-end justify-end">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={ras1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRas1(e.target.checked)
                }
              />
              <span className="ml-2">RAS</span>
            </label>
          </div>
        </div>

        <textarea
          value={observationEcart1}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setObservationEcart1(e.target.value)
          }
          className="w-full rounded-md border p-2"
          placeholder="Saisir votre observation ici"
        />
      </div>

      <div className="mb-6 rounded-lg bg-[#afb7c2]  p-4  text-white shadow-lg ">
        <h3 className="mb-2 ">
          Relevé du 21/07/2024{" "}
          <p className="text-sm text-gray-200">
            Le relevé banquaire à une date donnée.
          </p>
        </h3>
        <div className="mb-4 flex w-full ">
          <p className="w-full items-start justify-start ">
            Montant Bordereaux: <p className="">25 000 000 F CFA</p>
          </p>
          <p className=" w-full items-center justify-center ">
            Banque: <p className="">2 500 000 F CFA</p>
          </p>
          <p className="w-full items-end justify-end ">
            Montant Banque: <p className=" ">22 500 000 F CFA</p>
          </p>
        </div>
        <div className="mb-4 flex w-full ">
          <p>
            Écart 2: <p className="font-semibold text-red-600">0 F CFA</p>
          </p>
        </div>
      </div>
      {/* Relevé bancaire */}
      {/* <div className="rounded-lg border p-4 ">
				<h3 className="mb-2 font-bold">Relevé du 21/07/2024</h3>
				<div className="mb-4">
					<p>
						Montant Bordereaux:{" "}
						<span className="font-semibold">2 500 000 F CFA</span>
					</p>
					<p>
						Banque: <span className="font-semibold">BNP Paribas</span>
					</p>
					<p>
						Montant Banque:{" "}
						<span className="font-semibold">2 500 000 F CFA</span>
					</p>
					<p>
						Écart 2: <span className="font-semibold text-red-600">0 F CFA</span>
					</p>
				</div>
			</div> */}
      <div className="mb-4 rounded-lg border p-4">
        <h4 className="font-semibold">Montant Banque</h4>
        <input
          type="number"
          value={montantBanque}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setMontantBanque(Number(e.target.value))
          }
          className="w-full rounded-md border p-2"
          placeholder="Saisir le montant provenant de la banque"
        />
      </div>
      <div className="mb-4 rounded-lg border  p-4 shadow-lg ">
        <h4 className="text-lg text-[#FD8213]">Observation</h4>

        <div className="mb-10 flex w-full font-black text-gray-500">
          <p className="w-9/12 items-start justify-start">
            Observation sur l'écart entre les montants de la caisse et de la
            banque
          </p>
          <div className="mr-2 flex w-3/12 items-end justify-end">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={ras2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setRas1(e.target.checked)
                }
              />
              <span className="ml-2">RAS</span>
            </label>
          </div>
        </div>

        <textarea
          value={observationEcart1}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setObservationEcart1(e.target.value)
          }
          className="w-full rounded-md border p-2"
          placeholder="Saisir votre observation ici"
        />
      </div>
      {/* <div className="mb-4 rounded-lg border p-4">
				<h4 className="font-semibold">Observation</h4>
				<p className="mb-2 text-gray-500">
					Observation sur l'écart entre les montants de la caisse et de la
					banque
				</p>
				<textarea
					value={observationEcart2}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
						setObservationEcart2(e.target.value)
					}
					className="w-full rounded-md border p-2"
					placeholder="Saisir votre observation ici"
				/>
				<div className="mt-2">
					<label className="inline-flex items-center">
						<input
							type="checkbox"
							className="form-checkbox"
							checked={ras2}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setRas2(e.target.checked)
							}
						/>
						<span className="ml-2">RAS</span>
					</label>
				</div>
			</div> */}
    </div>
  );
};

export default DatatablesLitigesView;
