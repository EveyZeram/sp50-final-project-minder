const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			isLoggedIn: false,		// indicates if user is logged in
			isPharmacy: false,		
			postLoginAction: null,
			pharmacies: [],			//stores a list of pharmacies fetched from Google API
			selectedPharmacy:null,
			pharmacyDetails: null,
			pharmaciesNames: [],
			medicines: [],			 // stores a list of medicines fetched from our backend
			selectedMedicine: "",  // stores the selected medicine chosen by the patient when searching
			cities:[],				// stores a list of cities, used for city search functionality
			selectedCity: "",		// stores the selected city chosen by the user
			medicinesPsum: [],		// stores all the medicines which have distrib.problems
			totalMedicinesPsum: 0, // stores the total number of medicines which have distrib.problems
			orders:[],				// stores all orders made by an user
			ordersToPharmacy:[],	// stores all orders made to a specific pharmacy			
			updatedOrders:[],
			lastCreatedOrder: null, //stores the order details when an order is created so that later user can check it. NOTE FOR LATER: if order created --> ask pharmacy do you still have the stock available of that medicine? (we dont work with qty at the moment, just toggle avail/not avail, so they need to confirm)
			availablePharmacies:[],
			user_id: "",
			urlPostLogin:"/",
			selectedCityName: "",
			orderConfirmationDetails:[],
			notification:null

		},
		
		actions: {
			setSelectedCityName: (cityName) => {
				setStore({ selectedCityName: cityName });
			  },

			getMessage: async () => {
				try {
					// Fetching data from the backend
					const response = await fetch(process.env.BACKEND_URL + "/api/hello")
					const data = await response.json()
					setStore({message: data.message})
					return data;  // Don't forget to return something, that is how the async resolves
				} catch(error) {
					console.log("Error loading message from backend", error)
				}
			},
			
			login: async (loginResponse) => {
				console.log("El loginResponse -> ",loginResponse);
				console.log("HOLA DESDE login EN STORE")
				 // Define isPharmacy based on the role
  				// const isPharmacy = loginResponse.role === true;
				setStore({
					isLoggedIn: true,
					user_id: loginResponse.user_id,
					email: loginResponse.email,
					role: loginResponse.role,
					isPharmacy: loginResponse.is_pharmacy,
					urlPostLogin: loginResponse.is_pharmacy ? "/pharmacy" : "/patientHome",
				});
				localStorage.setItem("token", loginResponse.token);
				const userData = {
					user_id: loginResponse.user_id,
					email: loginResponse.email,
					role: loginResponse.role,
					isPharmacy: loginResponse.is_pharmacy
				};
				localStorage.setItem("userData", JSON.stringify(userData));
				 // Check if the user is a pharmacy or a patient and load respective data
				if (!isPharmacy) {
					// Load pharmacy profile and reservations (TBD - PROFILE!)
					await getActions().getUserOrders();
					
				} else {
					// Load patient profile and reservations (TBD - PROFILE!)
					await getActions().getPharmacyOrders();
				}
			},
		

			logout: () => {
				setStore({isLoggedIn: false});
				localStorage.removeItem("token");
			},

			
			isLogged : () => {
				if(localStorage.getItem("token")){
					setStore({isLogged: true})
					setStore({user_id: localStorage.getItem("user_id")})
					setStore({isPharmacy: localStorage.getItem("is_pharmacy")})

				}
			},

			setUrlLogin: (medicineId) => {
				setStore({urlPostLogin:`/results/${medicineId}/${getStore().selectedCityName}`})
					},
				
			setNotification: (message, type) => {
				setStore({notification: { message, type } // 'type' could be 'error', 'info', 'success', etc.
						});
			},
					  
			clearNotification: () => {
				setStore({notification: null});
			},
			
			// Get para lat/lng de la ciudad - busca por ciudad
			getPharmacies: async (city) => {
				// 1. Definir la URL que está en el env. Parámetro city. 
				const url_maps = `${process.env.BACKEND_URL}/api/maps?city=${city}&language=es`;
				// 2. Options - únicamente GET del listado de Farmacias
				const options = {
					method: 'GET'
				};
				// 3. Response
				const response = await fetch(url_maps, options);
				// 4. Verificar response (console log)
				if (response.ok) {
					// 5. If = ok; Tratamiento del OK - definimos el data
					const data = await response.json();
					// Grabar los datos en el store y en local Storage
					setStore({ "pharmacies": data.results })
					localStorage.setItem('pharmacies', JSON.stringify(data.results))
					console.log(data)
					console.log(data.results) // para ver qué trae
				} else {
					setStore({ "pharmacies": []})
					localStorage.setItem('pharmacies', [])
					console.log('Error:', "No encuentra Farmacias Cercanas")
				}
			},

			// Extraer Info de las Farmacias desde Api Places Details (POST)
            getPharmaciesDetails: async (place_pharmacy_id) => {
                // 1. Definir la URL + el dato de place_id que necesita google.
                const url_pharmacy_details = `${process.env.BACKEND_URL}/api/pharmacies_details`;
                // 2. Options - Usar POST porque lo requiere la API
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    // Para que la API funciona necesitamos el ID por lo tanto es lo que hay que enviar en el body
                    body: JSON.stringify({ place_id: place_pharmacy_id }),
                }
                const response = await fetch(url_pharmacy_details, options);
                if (response.ok) {
					// Tratamiento del IF = Ok. 
                 	const data = await response.json();
					console.log(data)
                    setStore({ pharmacyDetails: data.result });
                 	// localStorage.setItem('pharmacies', JSON.stringify(data.results));
					 localStorage.setItem('pharmacyDetails', JSON.stringify(data.result));
                } else {
                        console.log('Error', "No encuentra el ID de la Farmacia")
                    	 }
            },


			getAvailablePharmacies: async (medicineId) => {
				const response = await fetch(`${process.env.BACKEND_URL}/api/pharmacies/available?medicine_id=${medicineId}`);
				if (response.ok) {
					const data = await response.json();
					console.log(data)
					setStore({ availablePharmacies: data.pharmacies });
				} else {
					console.log("Failed to fetch available pharmacies for the selected medicine");
					setStore({ availablePharmacies: [] });
				}
			},


			getMedicines: async (value) => {
				// Clear previous search results
				setStore({ medicines: [] });

				const url = `${process.env.BACKEND_URL}/api/medicines/search?name=`+value;
				const options = {
					method: "GET"
				};
				const response = await fetch (url,options);
				if (response.ok) {
					const data = await response.json();
					console.log(data);
			
					if (data.results.medicines.length > 0) {
						setStore({ medicines: data.results.medicines });
						localStorage.setItem("medicines", JSON.stringify(data.results.medicines));
					} else {
						setStore({ medicines: [] });
						localStorage.setItem("medicines", JSON.stringify([]));
					}				
			
					return data;
				} else {
					console.log("Error:", response.status, response.statusText);
				}
			},
			getSelectedMedicine: (medicine) => {
				setStore({ selectedMedicine: medicine });
				},
			

			setSelectedPharmacy: (pharmacy) => {
    			setStore({ selectedPharmacy: pharmacy });
			},


			clearMedicines: () => {
				setStore({ medicines: [], selectedMedicine: "" });
			},
			
			
			// //CHANGE!!!! For now only use with Madrid example! ;)
			// getSearchCities: (searchQuery) => {
			// 	const mockCity = { id: 1, city_name: "Madrid" };
			// 	// Check if the search query matches "Madrid" (case insensitive)
			// 	if (mockCity.city_name.toLowerCase().includes(searchQuery.toLowerCase())) {
			// 		setStore({ cities: [mockCity] }); // If it matches, set the store with the mock city
			// 	} else {
			// 		setStore({ cities: [] });
			// 	}
			// },

			getPharmacyName: async (name) => {
				const url_maps = `${process.env.BACKEND_URL}/api/pharmacies_names?pharmacy=${name}`;
				const options = {
					method: 'GET'
				};
				// 3. Response
				const response = await fetch(url_maps, options);
				// 4. Verificar response (console log)
				// console.log(response)
				if (response.ok) {
					// 5. If = ok; Tratamiento del OK - definimos el data
					const data = await response.json();
					// Grabar los datos en el store y en local Storage
					setStore({ "pharmaciesNames": data.predictions })
					// localStorage.setItem('pharmaciesNames', JSON.stringify(data.predictions))
					// console.log(data.predictions)
				} else {
					setStore({ "pharmaciesNames": []})
					// localStorage.setItem('pharmaciesNames', [])
					console.log('Error:', "No encuentra Farmacias por el Nombre")
				}
			},

			getSelectedCity: (city) => {
				setStore({ selectedCity: city });
				},
			
			clearCities: () => {
				setStore({ cities: [] });
				},
			
			getMedicinesPsum: async () => {
				const url = `${process.env.BACKEND_URL}/api/medicines-psum`;
				const options = {
					method: "GET"
				};
				const response = await fetch(url, options);
					if (response.ok) {
						const data = await response.json();
						console.log(data);
						setStore({
							medicinesPsum: data.results.medicines,
							totalMedicinesPsum: data.results.total_medicines_psum,
						});
					} else {
						console.log("Medicamento no encontrado");
						setStore({
							medicinesPsum: [],
							totalMedicinesPsum: 0,
						});
					}
				},
			
			updateMedicineAvailability : async (medicineId, availability) => {
				const store = getStore();
				// Update local store
				const updatedMedicinesPsum = store.medicinesPsum.map(medicine => {
					if (medicine.id === medicineId) {
						return { ...medicine, is_available: availability };
					}
					return medicine;
				});
				setStore({ medicinesPsum: updatedMedicinesPsum });
				
				const url = `${process.env.BACKEND_URL}/api/pharmacies/${pharmacy_id}/medicines/${medicineId}/availability`;
				const token = localStorage.getItem('token');
				const options = {
					method: "PUT",
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({ medicine_id: medicineId, availability })
				};
				const response = await fetch(url, options);
					if (response.ok) {
						const data = await response.json();
						console.log(data);
						 // Success notification
						 alert("La disponibilidad se ha modificado correctamente!");
					} else {
						const errorData = await response.json();
						const errorMessage = errorData.message || "Error al editar la disponibilidad del medicamento. Por favor, pruebe de nuevo";
						console.error(errorMessage);
						// Error notification
						alert(errorMessage);
					}
				},

			createOrderReservation: async (medicineId) => {
				const { selectedPharmacy } = getStore(); 
				const pharmacyId = selectedPharmacy.id;

				const url = `${process.env.BACKEND_URL}/api/orders/`;
				const token = localStorage.getItem('token');
				
				const options = {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`
					},
					body: JSON.stringify({ 
						medicine_id: medicineId, 
						pharmacy_id: pharmacyId,
						requested_date: new Date().toISOString().split('T')[0] 
					})
					
				};
				const response = await fetch(url, options);
					if (response.ok) {
						const data = await response.json();
						console.log(data);
						setStore((prevState) => {
							const updatedOrders = [...prevState.orders, data.order];
							return {
								...prevState,
								lastCreatedOrder: data.order, // Saves the current order details 
								orders: updatedOrders // Adds the new order to the existing orders array
							};
						});
						setStore({ orderConfirmationDetails: data.order });
						return { success: true, order: data.order };
					} else {
						const errorData = await response.json();
						alert(errorData.message || "Error al hacer la reserva. Por favor, pruebe de nuevo"); 
						return { success: false };
					}
        			
				},

			getUserOrders: async () => {
				const url = `${process.env.BACKEND_URL}/api/orders`;
				const token = localStorage.getItem('token'); // Retrieve the token from localStorage
				const options = {
					method: "GET",
					headers: {
						'Authorization': `Bearer ${token}`, // Include the JWT token in the authorization header
						'Content-Type': 'application/json'
					  },
				};
				const response = await fetch (url,options);
				if (response.ok) {
					const data = await response.json();
					console.log(data);
					// We ensure that we're accessing the orders array within the results object
					if (data.results && data.results.orders) {
						setStore({ orders: data.results.orders }); // Update store with the orders array
						localStorage.setItem("orders", JSON.stringify(data.results.orders));
					} else {
						console.log("No se han encontrado reservas o el formato es incorrecto");
						setStore({ orders: [] });
						localStorage.setItem("orders", JSON.stringify([]));
					}
			
					return data;
				} else {
					console.log("Error:", response.status, response.statusText);
				}
			},

			getPharmacyOrders: async () => {
				//const pharmacyId = getStore().user_id;
				//const pharmacyId = 1
				const url = `${process.env.BACKEND_URL}/api/orders/pharmacy/`;
				const token = localStorage.getItem('token');
				const options = {
					method: "GET",
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					},
				};
				const response = await fetch(url, options);
				if (response.ok) {
					const data = await response.json();
					console.log(data);
						setStore({ ordersToPharmacy: data});
						localStorage.setItem("ordersToPharmacy", JSON.stringify(data));
				} else {
						console.log("No se han encontrado pedidos");
						setStore({ ordersToPharmacy: [] });
						localStorage.setItem("ordersToPharmacy", JSON.stringify([]));
					}
		
			},		


			
			// 		setStore({ medicines: data.results }); //1. if response ok, we save the data.results inside store-medicines[]. Now instead of having an empty array of medicines in store, we will have the array with the medicines
			// 		//2. we also need to save the data in the localStorage using localStorage.setItem("variable", JSON.stringify(value we want to assign to the variable));
			// 		//JSON.stringify is needed when we save in localStorage so it can read what's inside our data.results
			// 		localStorage.setItem("medicines", JSON.stringify(data.results));
			// 		console.log(store.medicines)
			// 		return data;  // Don't forget to return something, that is how the async resolves
			// 	} else {
			// 		console.log ("Error:", response.status, response.statusText);
			// 	}
			// },
			
		}
	};
};


export default getState;