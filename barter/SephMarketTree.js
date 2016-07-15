

var MARKET_TREE = {
	"marketable" : { 						
		"products" : {					//use up vs wear out					
			"consumable" : {					
				"edible" : {
					"nourishment" : {
						"raw" : {
							"vegetables" : {
								"tomatos" : {
									"heirloom tomato" : undefined,
									"baby tomato" : null
								}
							},
							"tea flavors" : {

							}
						},
						"prepared" : {
							"meals" : {
								"pizza" : null
							},
							"ingredients" : {
								"vegetables" : {
									"tomatos" : {
										"canned heirloom tomatos" : undefined
									}
								}

							},
							"condiments" : {
								"ketchup" : null,
								"mayonaise" : null
							}

						}
					},
					"refreshment" : {
						"indgredients" : {
							"powders" : {
								"gatorade powder" : null
							},
							"brewable" : {
								"coffee bean" : null,
								"tea leave" : null
							},
							"syrups" : {
								"simple syrup" : null
							}

						},
						"beverages" : {
							"hydrating" : {
								"water" : null,
								"vitaminwater" : null,
								"gatorade" : null
							},
							"flavorful" : {
								"soda" : {
									"cola" : null
								},
								"tea" : {
									"green tea" : null
								}
							}
						}
					}

				},
				"material" : {
					
				},
				"medical" : {
					"pain" : {
						"burn" : {
							"aloe" : null
						}
					},
					"health" : {
						"feminine" : {
							"vaginal" : {
								"yeast" : null
							}
						}
					},
					"energy" : {
						"caffiene pills" : null
					}

				},
				"exhaustable" : {

				}
			},

			"maintainable" : {	//for rent
				"objects" : {	
					"functional" : {
						"wearable" : {
							"shoes" : {
								"slippers" : null
							}
						},
					
						"tools" : {
							"kitchenware" : {
								"dishware" : {   //tags: ceramic, metal, glass, plastic
									"bowl" : null
								}
							},
							"information technology" : {
								"laptop" : null
							},
							"cleaning" : {
								"absorbing" : {
									"disposable" : {
										"paper towel" : null,
										"shop towel" : null,
									},
									"washable" : {
										"bath towel" : null
									}
								},
								"sucking" : {
									"vacuums" : {
										"hand vacuum" : null,
										"shop vac" : null
									}
								},
								"sweeping" : {
									"broom" : null
								}, 
								"scraping" : {
									"sponge" : null
								}							
							}
						},
						"furnishings" : {
							"storage" : {
								"cabinetry" : {
									"shelf" : null,
									"table" : null
								}
							}
						},
						"materials" : {
							"office" : {
								"paper" : true,
								"scissor" : null,
								"pen" : null	
							}
						}
					},
					
					"decorative" : {  //alias: decor, //taglist: thematic
						"lighting" : {
							"candle" : null,	
							"lamp" : null
						},
						"scent" : {
							"scented candle" : null
						},
						"visual" : {			
							"balloons" : null,	
							"cool rocks" : null,
							"art" : {
								"imagery" : {  	//2d
									"canvas" : null,
									"poster" : null,
									"photo" : null,
									"fabric" : null,
								},
								"modeled" : {	//3d
									"statue" : null
								}	
							}	
						}
					}
				},

				"spaces" : {

				},

				"living" : {
					"flora" : {

					},
					"fauna" : {

					}
				}
			}
		},
		"services" : {
			"teaching" : {
				"music" : {
					"piano" : null
				}
			},
			"repair" : {
				"automobile" : {
					"oil change" : null,
					"tune up" : null
				},
				"home" : {
					"septic" : null
				}
			},
			"rental" : {
				"tools" : {

				},
				"spaces" : {

				}
			}
		}
	},


	"abstract" : {
		"war" : false
	}
}





var treeToList = function(root, addToMe) {
	if(addToMe === undefined) 
		addToMe = [];

	

	for(var key in root) {
		var addMe = {};
		addMe.name = key;
		addMe.node = root[key];

		addToMe.push(addMe);
		treeToList(root[key], addToMe);
	}

	return addToMe;
}
var MARKET_LISTINGS = treeToList(MARKET_TREE);












