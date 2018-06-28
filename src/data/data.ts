export const types = [{
	name: "Savings",
	type: "sav"
}, {
	name: "Public Provident Fund",
	type: "ppf"
}, {
	name: "Life Insurance",
	type: "lifI"
}, {
	name: "National Pension Scheme",
	type: "nps"
}, {
	name: "Kisan Vikas Patra",
	type: "kvp"
}, {
	name: "Mutual Funds",
	type: "mf"
}, {
	name: "Stocks & Shares",
	type: "ss"
}, {
	name: "Bonds",
	type: "bonds"
}, {
	name: "ETFs",
	type: "etf"
}, {
	name: "Options",
	type: "opt"
}, {
	name: "Futures",
	type: "fut"
}, {
	name: "Peer to Peer Lending",
	type: "p2p"
}, {
	name: "Cryptocurrencies",
	type: "cc"
}, {
	name: "Real Estate",
	type: "re"
}, {
	name: "Gold",
	type: "gold"
}, {
	name: "Commodities",
	type: "comm"
}, {
	name: "Fixed Deposit",
	type: "fd"
}, {
	name: "Recurring Deposit",
	type: "rd"
}, {
	name: "Others",
	type: "others"
}];

export const categories = {
	'Debt': ['sav', 'ppf', 'lifI', 'nps', 'kvp', 'bonds', 'p2p', 'fd', 'rd'],
	'Equity': ['fut', 'etf', 'opt', 'ss', 'mf'],
	'Property': ['re'],
	'Others': ['others', 'comm', 'gold', 'cc']
};

export const months = {
	0: 'Jan',
	1: 'Feb',
	2: 'Mar',
	3: 'Apr',
	4: 'May',
	5: 'June',
	6: 'July',
	7: 'Aug',
	8: 'Sept',
	9: 'Oct',
	10: 'Nov',
	11: 'Dec'
}