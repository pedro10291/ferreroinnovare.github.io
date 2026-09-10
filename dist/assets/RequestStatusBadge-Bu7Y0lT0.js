import{c as t,j as a,t as r,p as o}from"./index-D8NLGYEH.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=t("Inbox",[["polyline",{points:"22 12 16 12 14 15 10 15 8 12 2 12",key:"o97t9d"}],["path",{d:"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",key:"oot6mr"}]]),n={PENDING:{label:"Pendente",classes:"bg-yellow-50 text-yellow-700 border-yellow-200"},IN_CONTACT:{label:"Em contato",classes:"bg-blue-50 text-blue-700 border-blue-200"},SCHEDULED:{label:"Agendado",classes:"bg-purple-50 text-purple-700 border-purple-200"},CONVERTED:{label:"Convertida",classes:"bg-green-50 text-green-700 border-green-200"},CANCELLED:{label:"Cancelada",classes:"bg-red-50 text-red-700 border-red-200"}},c=({status:e,className:s})=>{const l=n[e]||{label:e,classes:"bg-gray-50 text-gray-700 border-gray-200"};return a.jsx("span",{className:r(o("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",l.classes),s),children:l.label})};export{d as I,c as R};
