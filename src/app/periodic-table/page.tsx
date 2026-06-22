"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { ArrowLeft, X, Atom } from "lucide-react";
import Link from "next/link";

interface Element {
  number: number;
  symbol: string;
  name: string;
  mass: string;
  category: string;
  group: number;
  period: number;
  electrons: string;
  discovered: string;
  description: string;
}

const CATEGORIES: Record<string, { color: string; label: string }> = {
  "alkali-metal": { color: "#FF6B6B", label: "Alkali Metal" },
  "alkaline-earth": { color: "#FFA94D", label: "Alkaline Earth Metal" },
  "transition-metal": { color: "#FFD43B", label: "Transition Metal" },
  "post-transition": { color: "#69DB7C", label: "Post-Transition Metal" },
  "metalloid": { color: "#38D9A9", label: "Metalloid" },
  "nonmetal": { color: "#4DABF7", label: "Reactive Nonmetal" },
  "noble-gas": { color: "#B197FC", label: "Noble Gas" },
  "lanthanide": { color: "#F06595", label: "Lanthanide" },
  "actinide": { color: "#E599F7", label: "Actinide" },
  "unknown": { color: "#868E96", label: "Unknown" },
};

const ELEMENTS: Element[] = [
  { number: 1, symbol: "H", name: "Hydrogen", mass: "1.008", category: "nonmetal", group: 1, period: 1, electrons: "1", discovered: "1766", description: "The lightest and most abundant element in the universe. Stars are mostly hydrogen." },
  { number: 2, symbol: "He", name: "Helium", mass: "4.003", category: "noble-gas", group: 18, period: 1, electrons: "2", discovered: "1868", description: "Second lightest element. Used in balloons and discovered in the Sun before Earth." },
  { number: 3, symbol: "Li", name: "Lithium", mass: "6.941", category: "alkali-metal", group: 1, period: 2, electrons: "2,1", discovered: "1817", description: "Lightest metal. Used in batteries, mood stabilizers, and lightweight alloys." },
  { number: 4, symbol: "Be", name: "Beryllium", mass: "9.012", category: "alkaline-earth", group: 2, period: 2, electrons: "2,2", discovered: "1798", description: "Light, strong metal used in aerospace, X-ray windows, and nuclear reactors." },
  { number: 5, symbol: "B", name: "Boron", mass: "10.81", category: "metalloid", group: 13, period: 2, electrons: "2,3", discovered: "1808", description: "A metalloid essential for plant growth. Used in glass, detergents, and rocket fuel." },
  { number: 6, symbol: "C", name: "Carbon", mass: "12.01", category: "nonmetal", group: 14, period: 2, electrons: "2,4", discovered: "Ancient", description: "Basis of all known life. Forms diamonds, graphite, and millions of organic compounds." },
  { number: 7, symbol: "N", name: "Nitrogen", mass: "14.01", category: "nonmetal", group: 15, period: 2, electrons: "2,5", discovered: "1772", description: "Makes up 78% of Earth's atmosphere. Essential for proteins and DNA." },
  { number: 8, symbol: "O", name: "Oxygen", mass: "16.00", category: "nonmetal", group: 16, period: 2, electrons: "2,6", discovered: "1774", description: "Essential for respiration. Makes up 21% of atmosphere and most of Earth's crust by mass." },
  { number: 9, symbol: "F", name: "Fluorine", mass: "19.00", category: "nonmetal", group: 17, period: 2, electrons: "2,7", discovered: "1886", description: "Most reactive element. Used in toothpaste (fluoride) and non-stick coatings (Teflon)." },
  { number: 10, symbol: "Ne", name: "Neon", mass: "20.18", category: "noble-gas", group: 18, period: 2, electrons: "2,8", discovered: "1898", description: "Produces bright reddish-orange glow in signs. Fifth most abundant element in universe." },
  { number: 11, symbol: "Na", name: "Sodium", mass: "22.99", category: "alkali-metal", group: 1, period: 3, electrons: "2,8,1", discovered: "1807", description: "Soft, reactive metal. Essential for nerve function. Table salt is sodium chloride." },
  { number: 12, symbol: "Mg", name: "Magnesium", mass: "24.31", category: "alkaline-earth", group: 2, period: 3, electrons: "2,8,2", discovered: "1755", description: "Light structural metal. Burns with brilliant white light. Essential for chlorophyll." },
  { number: 13, symbol: "Al", name: "Aluminium", mass: "26.98", category: "post-transition", group: 13, period: 3, electrons: "2,8,3", discovered: "1825", description: "Most abundant metal in Earth's crust. Light, strong, and recyclable." },
  { number: 14, symbol: "Si", name: "Silicon", mass: "28.09", category: "metalloid", group: 14, period: 3, electrons: "2,8,4", discovered: "1824", description: "Second most abundant element in crust. Foundation of computer chips and solar panels." },
  { number: 15, symbol: "P", name: "Phosphorus", mass: "30.97", category: "nonmetal", group: 15, period: 3, electrons: "2,8,5", discovered: "1669", description: "Essential for DNA, bones, and teeth. White phosphorus glows in the dark." },
  { number: 16, symbol: "S", name: "Sulfur", mass: "32.07", category: "nonmetal", group: 16, period: 3, electrons: "2,8,6", discovered: "Ancient", description: "Yellow element with distinctive smell. Used in gunpowder, rubber, and medicines." },
  { number: 17, symbol: "Cl", name: "Chlorine", mass: "35.45", category: "nonmetal", group: 17, period: 3, electrons: "2,8,7", discovered: "1774", description: "Green-yellow gas used to purify water. Combined with sodium makes table salt." },
  { number: 18, symbol: "Ar", name: "Argon", mass: "39.95", category: "noble-gas", group: 18, period: 3, electrons: "2,8,8", discovered: "1894", description: "Third most abundant gas in atmosphere. Used in welding and light bulbs." },
  { number: 19, symbol: "K", name: "Potassium", mass: "39.10", category: "alkali-metal", group: 1, period: 4, electrons: "2,8,8,1", discovered: "1807", description: "Essential for heart and muscle function. Bananas are rich in potassium." },
  { number: 20, symbol: "Ca", name: "Calcium", mass: "40.08", category: "alkaline-earth", group: 2, period: 4, electrons: "2,8,8,2", discovered: "1808", description: "Builds bones and teeth. Fifth most abundant element in Earth's crust." },
  { number: 21, symbol: "Sc", name: "Scandium", mass: "44.96", category: "transition-metal", group: 3, period: 4, electrons: "2,8,9,2", discovered: "1879", description: "Light transition metal used in aerospace alloys and sports equipment." },
  { number: 22, symbol: "Ti", name: "Titanium", mass: "47.87", category: "transition-metal", group: 4, period: 4, electrons: "2,8,10,2", discovered: "1791", description: "Strong, light, corrosion-resistant. Used in jets, implants, and paint." },
  { number: 23, symbol: "V", name: "Vanadium", mass: "50.94", category: "transition-metal", group: 5, period: 4, electrons: "2,8,11,2", discovered: "1801", description: "Hard metal that strengthens steel. Named after Norse goddess Vanadis." },
  { number: 24, symbol: "Cr", name: "Chromium", mass: "52.00", category: "transition-metal", group: 6, period: 4, electrons: "2,8,13,1", discovered: "1797", description: "Shiny metal used for chrome plating. Makes stainless steel stainless." },
  { number: 25, symbol: "Mn", name: "Manganese", mass: "54.94", category: "transition-metal", group: 7, period: 4, electrons: "2,8,13,2", discovered: "1774", description: "Essential for steel production and batteries. Important for bone formation." },
  { number: 26, symbol: "Fe", name: "Iron", mass: "55.85", category: "transition-metal", group: 8, period: 4, electrons: "2,8,14,2", discovered: "Ancient", description: "Most used metal. Earth's core is mostly iron. Essential for blood hemoglobin." },
  { number: 27, symbol: "Co", name: "Cobalt", mass: "58.93", category: "transition-metal", group: 9, period: 4, electrons: "2,8,15,2", discovered: "1735", description: "Blue pigment since ancient times. Used in rechargeable batteries and magnets." },
  { number: 28, symbol: "Ni", name: "Nickel", mass: "58.69", category: "transition-metal", group: 10, period: 4, electrons: "2,8,16,2", discovered: "1751", description: "Corrosion-resistant metal used in coins, stainless steel, and batteries." },
  { number: 29, symbol: "Cu", name: "Copper", mass: "63.55", category: "transition-metal", group: 11, period: 4, electrons: "2,8,18,1", discovered: "Ancient", description: "Excellent conductor. Used in wiring, plumbing, and coins for thousands of years." },
  { number: 30, symbol: "Zn", name: "Zinc", mass: "65.38", category: "transition-metal", group: 12, period: 4, electrons: "2,8,18,2", discovered: "1746", description: "Protects iron from rust (galvanizing). Essential mineral for immune system." },
  { number: 31, symbol: "Ga", name: "Gallium", mass: "69.72", category: "post-transition", group: 13, period: 4, electrons: "2,8,18,3", discovered: "1875", description: "Melts in your hand (29.8°C). Used in LEDs, smartphones, and solar panels." },
  { number: 32, symbol: "Ge", name: "Germanium", mass: "72.63", category: "metalloid", group: 14, period: 4, electrons: "2,8,18,4", discovered: "1886", description: "Semiconductor used in fiber optics and early transistors." },
  { number: 33, symbol: "As", name: "Arsenic", mass: "74.92", category: "metalloid", group: 15, period: 4, electrons: "2,8,18,5", discovered: "1250", description: "Toxic metalloid historically used as poison. Now used in semiconductors." },
  { number: 34, symbol: "Se", name: "Selenium", mass: "78.97", category: "nonmetal", group: 16, period: 4, electrons: "2,8,18,6", discovered: "1817", description: "Essential trace element. Used in electronics and anti-dandruff shampoos." },
  { number: 35, symbol: "Br", name: "Bromine", mass: "79.90", category: "nonmetal", group: 17, period: 4, electrons: "2,8,18,7", discovered: "1826", description: "Only non-metal that is liquid at room temperature. Red-brown with strong odor." },
  { number: 36, symbol: "Kr", name: "Krypton", mass: "83.80", category: "noble-gas", group: 18, period: 4, electrons: "2,8,18,8", discovered: "1898", description: "Noble gas used in flash photography and some fluorescent lights. Not Superman's planet!" },
  { number: 37, symbol: "Rb", name: "Rubidium", mass: "85.47", category: "alkali-metal", group: 1, period: 5, electrons: "2,8,18,8,1", discovered: "1861", description: "Soft, silvery metal that ignites in air. Used in atomic clocks and GPS." },
  { number: 38, symbol: "Sr", name: "Strontium", mass: "87.62", category: "alkaline-earth", group: 2, period: 5, electrons: "2,8,18,8,2", discovered: "1790", description: "Produces brilliant red in fireworks. Used in CRT TVs and glow-in-dark paints." },
  { number: 39, symbol: "Y", name: "Yttrium", mass: "88.91", category: "transition-metal", group: 3, period: 5, electrons: "2,8,18,9,2", discovered: "1794", description: "Used in LEDs, lasers, and superconductors. Named after Ytterby village in Sweden." },
  { number: 40, symbol: "Zr", name: "Zirconium", mass: "91.22", category: "transition-metal", group: 4, period: 5, electrons: "2,8,18,10,2", discovered: "1789", description: "Resistant to corrosion and heat. Used in nuclear reactors and artificial gems." },
  { number: 41, symbol: "Nb", name: "Niobium", mass: "92.91", category: "transition-metal", group: 5, period: 5, electrons: "2,8,18,12,1", discovered: "1801", description: "Superconducting metal used in MRI machines, jet engines, and rockets." },
  { number: 42, symbol: "Mo", name: "Molybdenum", mass: "95.95", category: "transition-metal", group: 6, period: 5, electrons: "2,8,18,13,1", discovered: "1781", description: "High melting point metal used to strengthen steel. Essential trace element." },
  { number: 43, symbol: "Tc", name: "Technetium", mass: "(98)", category: "transition-metal", group: 7, period: 5, electrons: "2,8,18,13,2", discovered: "1937", description: "First artificially produced element. Used in medical imaging (bone scans)." },
  { number: 44, symbol: "Ru", name: "Ruthenium", mass: "101.1", category: "transition-metal", group: 8, period: 5, electrons: "2,8,18,15,1", discovered: "1844", description: "Rare platinum group metal. Used in electronics and wear-resistant coatings." },
  { number: 45, symbol: "Rh", name: "Rhodium", mass: "102.9", category: "transition-metal", group: 9, period: 5, electrons: "2,8,18,16,1", discovered: "1803", description: "Most expensive precious metal. Used in catalytic converters and jewelry plating." },
  { number: 46, symbol: "Pd", name: "Palladium", mass: "106.4", category: "transition-metal", group: 10, period: 5, electrons: "2,8,18,18", discovered: "1803", description: "Absorbs 900x its volume in hydrogen. Used in catalytic converters and electronics." },
  { number: 47, symbol: "Ag", name: "Silver", mass: "107.9", category: "transition-metal", group: 11, period: 5, electrons: "2,8,18,18,1", discovered: "Ancient", description: "Best conductor of electricity and heat. Used in jewelry, photography, and medicine." },
  { number: 48, symbol: "Cd", name: "Cadmium", mass: "112.4", category: "transition-metal", group: 12, period: 5, electrons: "2,8,18,18,2", discovered: "1817", description: "Toxic heavy metal once used in batteries and yellow pigments." },
  { number: 49, symbol: "In", name: "Indium", mass: "114.8", category: "post-transition", group: 13, period: 5, electrons: "2,8,18,18,3", discovered: "1863", description: "Soft metal used in touchscreens (ITO), solders, and LCD displays." },
  { number: 50, symbol: "Sn", name: "Tin", mass: "118.7", category: "post-transition", group: 14, period: 5, electrons: "2,8,18,18,4", discovered: "Ancient", description: "Used in bronze since 3000 BC. Now used in tin cans, solder, and pewter." },
  { number: 51, symbol: "Sb", name: "Antimony", mass: "121.8", category: "metalloid", group: 15, period: 5, electrons: "2,8,18,18,5", discovered: "Ancient", description: "Used in flame retardants and lead-acid batteries. Known since ancient Egypt." },
  { number: 52, symbol: "Te", name: "Tellurium", mass: "127.6", category: "metalloid", group: 16, period: 5, electrons: "2,8,18,18,6", discovered: "1783", description: "Rare metalloid used in solar panels and thermoelectric devices." },
  { number: 53, symbol: "I", name: "Iodine", mass: "126.9", category: "nonmetal", group: 17, period: 5, electrons: "2,8,18,18,7", discovered: "1811", description: "Essential for thyroid function. Sublimes into beautiful purple vapor." },
  { number: 54, symbol: "Xe", name: "Xenon", mass: "131.3", category: "noble-gas", group: 18, period: 5, electrons: "2,8,18,18,8", discovered: "1898", description: "Used in flash lamps, ion propulsion engines, and anesthesia." },
  { number: 55, symbol: "Cs", name: "Caesium", mass: "132.9", category: "alkali-metal", group: 1, period: 6, electrons: "2,8,18,18,8,1", discovered: "1860", description: "Most reactive metal. Atomic clocks use caesium — defines the second." },
  { number: 56, symbol: "Ba", name: "Barium", mass: "137.3", category: "alkaline-earth", group: 2, period: 6, electrons: "2,8,18,18,8,2", discovered: "1808", description: "Green fireworks color. Barium meals help X-ray the digestive system." },
  { number: 57, symbol: "La", name: "Lanthanum", mass: "138.9", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,18,9,2", discovered: "1839", description: "First lanthanide. Used in camera lenses, catalysts, and hybrid car batteries." },
  { number: 58, symbol: "Ce", name: "Cerium", mass: "140.1", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,19,9,2", discovered: "1803", description: "Most abundant rare earth. Used in catalytic converters and lighter flints." },
  { number: 59, symbol: "Pr", name: "Praseodymium", mass: "140.9", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,21,8,2", discovered: "1885", description: "Creates strong permanent magnets. Used in aircraft engines." },
  { number: 60, symbol: "Nd", name: "Neodymium", mass: "144.2", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,22,8,2", discovered: "1885", description: "Makes the strongest permanent magnets. Used in headphones and wind turbines." },
  { number: 61, symbol: "Pm", name: "Promethium", mass: "(145)", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,23,8,2", discovered: "1945", description: "Radioactive rare earth. Used in nuclear batteries and luminous paint." },
  { number: 62, symbol: "Sm", name: "Samarium", mass: "150.4", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,24,8,2", discovered: "1879", description: "Used in strong magnets and cancer treatment (Samarium-153)." },
  { number: 63, symbol: "Eu", name: "Europium", mass: "152.0", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,25,8,2", discovered: "1901", description: "Produces red and blue phosphors in TVs. Used in euro banknote anti-forgery." },
  { number: 64, symbol: "Gd", name: "Gadolinium", mass: "157.3", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,25,9,2", discovered: "1880", description: "Used as MRI contrast agent. Has unusual magnetic properties." },
  { number: 65, symbol: "Tb", name: "Terbium", mass: "158.9", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,27,8,2", discovered: "1843", description: "Green phosphor in screens. Used in solid-state devices." },
  { number: 66, symbol: "Dy", name: "Dysprosium", mass: "162.5", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,28,8,2", discovered: "1886", description: "Used in nuclear reactors and high-powered magnets for electric vehicles." },
  { number: 67, symbol: "Ho", name: "Holmium", mass: "164.9", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,29,8,2", discovered: "1878", description: "Strongest magnetic element. Used in lasers for medical surgery." },
  { number: 68, symbol: "Er", name: "Erbium", mass: "167.3", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,30,8,2", discovered: "1842", description: "Pink-colored compounds. Used in fiber optic amplifiers and lasers." },
  { number: 69, symbol: "Tm", name: "Thulium", mass: "168.9", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,31,8,2", discovered: "1879", description: "Rarest naturally occurring lanthanide. Used in portable X-ray devices." },
  { number: 70, symbol: "Yb", name: "Ytterbium", mass: "173.0", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,32,8,2", discovered: "1878", description: "Used in atomic clocks more accurate than caesium. Also in stress gauges." },
  { number: 71, symbol: "Lu", name: "Lutetium", mass: "175.0", category: "lanthanide", group: 3, period: 6, electrons: "2,8,18,32,9,2", discovered: "1907", description: "Densest and hardest lanthanide. Used in PET scan detectors." },
  { number: 72, symbol: "Hf", name: "Hafnium", mass: "178.5", category: "transition-metal", group: 4, period: 6, electrons: "2,8,18,32,10,2", discovered: "1923", description: "Used in nuclear reactor control rods and next-gen computer chips." },
  { number: 73, symbol: "Ta", name: "Tantalum", mass: "180.9", category: "transition-metal", group: 5, period: 6, electrons: "2,8,18,32,11,2", discovered: "1802", description: "Highly corrosion-resistant. Used in phone capacitors and surgical implants." },
  { number: 74, symbol: "W", name: "Tungsten", mass: "183.8", category: "transition-metal", group: 6, period: 6, electrons: "2,8,18,32,12,2", discovered: "1783", description: "Highest melting point of all elements (3422°C). Used in light bulb filaments." },
  { number: 75, symbol: "Re", name: "Rhenium", mass: "186.2", category: "transition-metal", group: 7, period: 6, electrons: "2,8,18,32,13,2", discovered: "1925", description: "Last stable element discovered. Used in jet engine superalloys." },
  { number: 76, symbol: "Os", name: "Osmium", mass: "190.2", category: "transition-metal", group: 8, period: 6, electrons: "2,8,18,32,14,2", discovered: "1803", description: "Densest naturally occurring element. Blue-gray with pungent oxide." },
  { number: 77, symbol: "Ir", name: "Iridium", mass: "192.2", category: "transition-metal", group: 9, period: 6, electrons: "2,8,18,32,15,2", discovered: "1803", description: "Most corrosion-resistant metal. Asteroid that killed dinosaurs was iridium-rich." },
  { number: 78, symbol: "Pt", name: "Platinum", mass: "195.1", category: "transition-metal", group: 10, period: 6, electrons: "2,8,18,32,17,1", discovered: "1735", description: "Precious metal used in catalytic converters, jewelry, and cancer drugs." },
  { number: 79, symbol: "Au", name: "Gold", mass: "197.0", category: "transition-metal", group: 11, period: 6, electrons: "2,8,18,32,18,1", discovered: "Ancient", description: "Prized since prehistory. Excellent conductor, doesn't tarnish. Symbol of wealth." },
  { number: 80, symbol: "Hg", name: "Mercury", mass: "200.6", category: "transition-metal", group: 12, period: 6, electrons: "2,8,18,32,18,2", discovered: "Ancient", description: "Only metal that's liquid at room temperature. Used in thermometers and barometers." },
  { number: 81, symbol: "Tl", name: "Thallium", mass: "204.4", category: "post-transition", group: 13, period: 6, electrons: "2,8,18,32,18,3", discovered: "1861", description: "Highly toxic metal once used as rat poison. Now used in electronics." },
  { number: 82, symbol: "Pb", name: "Lead", mass: "207.2", category: "post-transition", group: 14, period: 6, electrons: "2,8,18,32,18,4", discovered: "Ancient", description: "Dense, soft metal. Used in batteries, radiation shielding, and historically in pipes." },
  { number: 83, symbol: "Bi", name: "Bismuth", mass: "209.0", category: "post-transition", group: 15, period: 6, electrons: "2,8,18,32,18,5", discovered: "1753", description: "Forms beautiful rainbow crystals. Used in Pepto-Bismol and cosmetics." },
  { number: 84, symbol: "Po", name: "Polonium", mass: "(209)", category: "post-transition", group: 16, period: 6, electrons: "2,8,18,32,18,6", discovered: "1898", description: "Intensely radioactive. Discovered by Marie Curie, named after Poland." },
  { number: 85, symbol: "At", name: "Astatine", mass: "(210)", category: "nonmetal", group: 17, period: 6, electrons: "2,8,18,32,18,7", discovered: "1940", description: "Rarest naturally occurring element. Less than 30g exists on Earth at any time." },
  { number: 86, symbol: "Rn", name: "Radon", mass: "(222)", category: "noble-gas", group: 18, period: 6, electrons: "2,8,18,32,18,8", discovered: "1900", description: "Radioactive noble gas from uranium decay. Second leading cause of lung cancer." },
  { number: 87, symbol: "Fr", name: "Francium", mass: "(223)", category: "alkali-metal", group: 1, period: 7, electrons: "2,8,18,32,18,8,1", discovered: "1939", description: "Most unstable natural element. Only ~30g exists on Earth. Extremely radioactive." },
  { number: 88, symbol: "Ra", name: "Radium", mass: "(226)", category: "alkaline-earth", group: 2, period: 7, electrons: "2,8,18,32,18,8,2", discovered: "1898", description: "Discovered by the Curies. Once used in glow-in-dark paint. Highly radioactive." },
  { number: 89, symbol: "Ac", name: "Actinium", mass: "(227)", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,18,9,2", discovered: "1899", description: "Glows blue in the dark. Used in targeted cancer therapy research." },
  { number: 90, symbol: "Th", name: "Thorium", mass: "232.0", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,18,10,2", discovered: "1829", description: "Potential nuclear fuel — more abundant than uranium. Named after Thor." },
  { number: 91, symbol: "Pa", name: "Protactinium", mass: "231.0", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,20,9,2", discovered: "1913", description: "Rare, toxic, and radioactive. One of the rarest natural elements." },
  { number: 92, symbol: "U", name: "Uranium", mass: "238.0", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,21,9,2", discovered: "1789", description: "Powers nuclear reactors and weapons. Natural uranium is mostly U-238." },
  { number: 93, symbol: "Np", name: "Neptunium", mass: "(237)", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,22,9,2", discovered: "1940", description: "First transuranium element produced. Named after planet Neptune." },
  { number: 94, symbol: "Pu", name: "Plutonium", mass: "(244)", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,24,8,2", discovered: "1940", description: "Used in nuclear weapons and spacecraft power. Extremely toxic." },
  { number: 95, symbol: "Am", name: "Americium", mass: "(243)", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,25,8,2", discovered: "1944", description: "Used in smoke detectors. Named after the Americas." },
  { number: 96, symbol: "Cm", name: "Curium", mass: "(247)", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,25,9,2", discovered: "1944", description: "Named after Marie and Pierre Curie. Used as power source in space probes." },
  { number: 97, symbol: "Bk", name: "Berkelium", mass: "(247)", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,27,8,2", discovered: "1949", description: "Named after Berkeley, California. Produced in tiny amounts in reactors." },
  { number: 98, symbol: "Cf", name: "Californium", mass: "(251)", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,28,8,2", discovered: "1950", description: "Used to start nuclear reactors and detect gold/silver ores. Costs $27M/gram." },
  { number: 99, symbol: "Es", name: "Einsteinium", mass: "(252)", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,29,8,2", discovered: "1952", description: "Discovered in debris of first hydrogen bomb test. Named after Einstein." },
  { number: 100, symbol: "Fm", name: "Fermium", mass: "(257)", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,30,8,2", discovered: "1952", description: "Named after Enrico Fermi. Created in nuclear explosions and reactors." },
  { number: 101, symbol: "Md", name: "Mendelevium", mass: "(258)", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,31,8,2", discovered: "1955", description: "Named after Dmitri Mendeleev, creator of the periodic table." },
  { number: 102, symbol: "No", name: "Nobelium", mass: "(259)", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,32,8,2", discovered: "1958", description: "Named after Alfred Nobel. Only a few atoms have ever been produced." },
  { number: 103, symbol: "Lr", name: "Lawrencium", mass: "(266)", category: "actinide", group: 3, period: 7, electrons: "2,8,18,32,32,8,3", discovered: "1961", description: "Last actinide. Named after Ernest Lawrence, inventor of the cyclotron." },
  { number: 104, symbol: "Rf", name: "Rutherfordium", mass: "(267)", category: "transition-metal", group: 4, period: 7, electrons: "2,8,18,32,32,10,2", discovered: "1964", description: "Named after Ernest Rutherford. Exists only for seconds in labs." },
  { number: 105, symbol: "Db", name: "Dubnium", mass: "(268)", category: "transition-metal", group: 5, period: 7, electrons: "2,8,18,32,32,11,2", discovered: "1967", description: "Named after Dubna, Russia. Highly radioactive with short half-life." },
  { number: 106, symbol: "Sg", name: "Seaborgium", mass: "(269)", category: "transition-metal", group: 6, period: 7, electrons: "2,8,18,32,32,12,2", discovered: "1974", description: "Named after Glenn Seaborg while he was still alive — a first!" },
  { number: 107, symbol: "Bh", name: "Bohrium", mass: "(270)", category: "transition-metal", group: 7, period: 7, electrons: "2,8,18,32,32,13,2", discovered: "1981", description: "Named after Niels Bohr. Only a few atoms ever created." },
  { number: 108, symbol: "Hs", name: "Hassium", mass: "(277)", category: "transition-metal", group: 8, period: 7, electrons: "2,8,18,32,32,14,2", discovered: "1984", description: "Named after Hesse, Germany. Densest element ever created." },
  { number: 109, symbol: "Mt", name: "Meitnerium", mass: "(278)", category: "unknown", group: 9, period: 7, electrons: "2,8,18,32,32,15,2", discovered: "1982", description: "Named after Lise Meitner, pioneer of nuclear fission." },
  { number: 110, symbol: "Ds", name: "Darmstadtium", mass: "(281)", category: "unknown", group: 10, period: 7, electrons: "2,8,18,32,32,16,2", discovered: "1994", description: "Named after Darmstadt, Germany. Exists for milliseconds." },
  { number: 111, symbol: "Rg", name: "Roentgenium", mass: "(282)", category: "unknown", group: 11, period: 7, electrons: "2,8,18,32,32,17,2", discovered: "1994", description: "Named after Wilhelm Röntgen, discoverer of X-rays." },
  { number: 112, symbol: "Cn", name: "Copernicium", mass: "(285)", category: "unknown", group: 12, period: 7, electrons: "2,8,18,32,32,18,2", discovered: "1996", description: "Named after Copernicus. May be a gas at room temperature!" },
  { number: 113, symbol: "Nh", name: "Nihonium", mass: "(286)", category: "unknown", group: 13, period: 7, electrons: "2,8,18,32,32,18,3", discovered: "2003", description: "Named after Japan (Nihon). First element discovered in Asia." },
  { number: 114, symbol: "Fl", name: "Flerovium", mass: "(289)", category: "unknown", group: 14, period: 7, electrons: "2,8,18,32,32,18,4", discovered: "1998", description: "Named after Flerov Laboratory. May be unusually stable for a superheavy." },
  { number: 115, symbol: "Mc", name: "Moscovium", mass: "(290)", category: "unknown", group: 15, period: 7, electrons: "2,8,18,32,32,18,5", discovered: "2003", description: "Named after Moscow Oblast. Exists for less than a second." },
  { number: 116, symbol: "Lv", name: "Livermorium", mass: "(293)", category: "unknown", group: 16, period: 7, electrons: "2,8,18,32,32,18,6", discovered: "2000", description: "Named after Lawrence Livermore Lab. Highly unstable." },
  { number: 117, symbol: "Ts", name: "Tennessine", mass: "(294)", category: "unknown", group: 17, period: 7, electrons: "2,8,18,32,32,18,7", discovered: "2010", description: "Named after Tennessee. One of the newest elements confirmed." },
  { number: 118, symbol: "Og", name: "Oganesson", mass: "(294)", category: "unknown", group: 18, period: 7, electrons: "2,8,18,32,32,18,8", discovered: "2002", description: "Heaviest element. Named after Yuri Oganessian. May not behave as noble gas." },
];

function getTablePosition(el: Element): [number, number] {
  if (el.number >= 57 && el.number <= 71) {
    return [el.number - 57 + 3, 8.5];
  }
  if (el.number >= 89 && el.number <= 103) {
    return [el.number - 89 + 3, 9.5];
  }
  return [el.group, el.period];
}

export default function PeriodicTablePage() {
  const [selected, setSelected] = useState<Element | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-screen w-screen text-white relative overflow-hidden bg-[#060a12]">
      <div className="absolute top-3 left-3 z-30">
        <Link href="/" className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-200 hover:text-white hover:bg-white/20 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
      </div>

      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
          <Atom className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: "4s" }} />
          <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">3D Periodic Table</span>
          <span className="text-[10px] text-slate-500 ml-1">118 Elements</span>
        </div>
      </div>

      {/* Search */}
      <div className="absolute top-3 right-3 z-30">
        <input
          type="text"
          placeholder="Search element..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white placeholder:text-slate-500 w-36 focus:outline-none focus:border-cyan-500/50"
        />
      </div>

      {/* Category filter */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex flex-wrap justify-center gap-1 max-w-3xl px-4">
        <button onClick={() => setFilterCategory(null)} className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all border ${!filterCategory ? "bg-white/20 border-white/30 text-white" : "bg-black/30 border-white/5 text-slate-500 hover:text-white"}`}>All</button>
        {Object.entries(CATEGORIES).map(([key, { color, label }]) => (
          <button key={key} onClick={() => setFilterCategory(filterCategory === key ? null : key)} className={`px-2 py-0.5 rounded text-[9px] font-medium transition-all border ${filterCategory === key ? "border-white/30 text-white" : "border-white/5 text-slate-500 hover:text-white"}`} style={{ backgroundColor: filterCategory === key ? color + "44" : "rgba(0,0,0,0.3)" }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: color }} />{label}
          </button>
        ))}
      </div>

      <Canvas shadows camera={{ position: [2, -1, 20], fov: 50 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
        <Scene elements={ELEMENTS} selected={selected} onSelect={setSelected} filterCategory={filterCategory} searchQuery={searchQuery} />
      </Canvas>

      {/* Element detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} className="absolute top-28 right-4 z-30 w-80">
            <div className="bg-black/85 backdrop-blur-xl rounded-2xl p-5 border shadow-2xl" style={{ borderColor: CATEGORIES[selected.category]?.color + "33" }}>
              <button onClick={() => setSelected(null)} className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-18 h-18 rounded-xl flex items-center justify-center text-4xl font-bold relative overflow-hidden" style={{ backgroundColor: CATEGORIES[selected.category]?.color + "22", color: CATEGORIES[selected.category]?.color, width: "72px", height: "72px" }}>
                  {selected.symbol}
                  <div className="absolute inset-0 rounded-xl border-2" style={{ borderColor: CATEGORIES[selected.category]?.color + "44" }} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 font-mono">Atomic #{selected.number}</div>
                  <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: CATEGORIES[selected.category]?.color + "22", color: CATEGORIES[selected.category]?.color }}>{CATEGORIES[selected.category]?.label}</span>
                </div>
              </div>
              {/* Electron shell visualization */}
              <div className="mb-3 bg-white/3 rounded-lg p-2 border border-white/5">
                <div className="text-[9px] text-slate-500 mb-1">Electron Configuration</div>
                <div className="flex items-center gap-1 flex-wrap">
                  {selected.electrons.split(",").map((shell, i) => (
                    <div key={i} className="flex items-center gap-0.5">
                      <div className="w-6 h-6 rounded-full border flex items-center justify-center text-[9px] font-bold" style={{ borderColor: CATEGORIES[selected.category]?.color + "66", color: CATEGORIES[selected.category]?.color }}>{shell}</div>
                      {i < selected.electrons.split(",").length - 1 && <span className="text-slate-600 text-[8px]">·</span>}
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-3">{selected.description}</p>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-white/5 rounded-lg px-2.5 py-2 border border-white/5"><span className="text-slate-500 block mb-0.5">Atomic Mass</span><span className="text-white font-bold text-sm">{selected.mass} u</span></div>
                <div className="bg-white/5 rounded-lg px-2.5 py-2 border border-white/5"><span className="text-slate-500 block mb-0.5">Period / Group</span><span className="text-white font-bold text-sm">{selected.period} / {getTablePosition(selected)[0]}</span></div>
                <div className="bg-white/5 rounded-lg px-2.5 py-2 border border-white/5"><span className="text-slate-500 block mb-0.5">Discovered</span><span className="text-white font-bold text-sm">{selected.discovered}</span></div>
                <div className="bg-white/5 rounded-lg px-2.5 py-2 border border-white/5"><span className="text-slate-500 block mb-0.5">Symbol</span><span className="text-white font-bold text-sm">{selected.symbol}</span></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="bg-black/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/5 text-[10px] text-slate-500 flex items-center gap-3">
          <span>👆 Click element for details</span><span>🔍 Search by name or symbol</span><span>🎨 Filter by category</span>
        </div>
      </div>
    </div>
  );
}

function Scene({ elements, selected, onSelect, filterCategory, searchQuery }: { elements: Element[]; selected: Element | null; onSelect: (el: Element | null) => void; filterCategory: string | null; searchQuery: string }) {
  const filteredHighlight = searchQuery.trim().toLowerCase();
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.03;
      groupRef.current.rotation.x = Math.cos(t * 0.08) * 0.015;
    }
  });

  return (
    <>
      <color attach="background" args={["#040810"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 20]} intensity={2} color="#e8f4ff" />
      <pointLight position={[-15, 8, 12]} intensity={1} color="#2266ff" distance={50} />
      <pointLight position={[15, -8, 12]} intensity={0.8} color="#ff2266" distance={50} />
      <pointLight position={[0, 0, 18]} intensity={0.6} color="#ffffff" distance={30} />
      <spotLight position={[0, 15, 20]} angle={0.4} penumbra={0.8} intensity={1.2} color="#aaccff" target-position={[0, 0, 0]} />

      {/* Table group with subtle sway */}
      <group ref={groupRef} rotation={[0.08, -0.05, 0]}>
        {elements.map((el) => {
          const matchesSearch = !filteredHighlight || el.name.toLowerCase().includes(filteredHighlight) || el.symbol.toLowerCase().includes(filteredHighlight);
          const dimmed = (!!filterCategory && el.category !== filterCategory) || (!!filteredHighlight && !matchesSearch);
          return <ElementCell key={el.number} element={el} isSelected={selected?.number === el.number} onSelect={onSelect} dimmed={dimmed} />;
        })}
      </group>

      <BackdropRings />
      <FloatingParticles />
      <NebulaClouds />
    </>
  );
}

function ElementCell({ element, isSelected, onSelect, dimmed }: { element: Element; isSelected: boolean; onSelect: (el: Element) => void; dimmed: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [pos] = useState<[number, number]>(() => getTablePosition(element));
  const color = CATEGORIES[element.category]?.color || "#888";

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const waveOffset = Math.sin(t * 0.8 + pos[0] * 0.3 + pos[1] * 0.4) * 0.06;
    if (isSelected) {
      ref.current.position.z = Math.sin(t * 2) * 0.08 + 1.2;
      ref.current.rotation.y = Math.sin(t * 1.5) * 0.1;
    } else if (hovered) {
      ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, 0.6, 0.12);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, 0, 0.1);
    } else {
      ref.current.position.z = THREE.MathUtils.lerp(ref.current.position.z, waveOffset, 0.06);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, 0, 0.1);
    }
  });

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(element);
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(element.name);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    } catch {}
  }, [element, onSelect]);

  const x = (pos[0] - 9.5) * 1.15;
  const y = -(pos[1] - 5) * 1.15;

  return (
    <group ref={ref} position={[x, y, 0]} onClick={handleClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Main block */}
      <RoundedBox args={[1, 1, 0.5]} radius={0.06} smoothness={3}>
        <meshStandardMaterial
          color={dimmed ? "#181818" : color}
          emissive={dimmed ? "#000" : color}
          emissiveIntensity={isSelected ? 0.8 : hovered ? 0.5 : 0.1}
          roughness={isSelected ? 0.1 : hovered ? 0.2 : 0.4}
          metalness={isSelected ? 0.7 : hovered ? 0.5 : 0.3}
          transparent
          opacity={dimmed ? 0.08 : 1}
        />
      </RoundedBox>
      {/* Glass top face */}
      {!dimmed && (
        <mesh position={[0, 0, 0.255]}>
          <planeGeometry args={[0.92, 0.92]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.35} />
        </mesh>
      )}
      {/* Edge glow */}
      {(isSelected || hovered) && !dimmed && (
        <mesh position={[0, 0, 0.01]}>
          <boxGeometry args={[1.06, 1.06, 0.52]} />
          <meshBasicMaterial color={color} transparent opacity={isSelected ? 0.2 : 0.1} wireframe />
        </mesh>
      )}
      {!dimmed && (
        <>
          <Text position={[0, 0.02, 0.28]} fontSize={0.38} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.01} outlineColor="#000000">
            {element.symbol}
          </Text>
          <Text position={[-0.32, 0.36, 0.28]} fontSize={0.14} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.005} outlineColor="#000000">
            {element.number.toString()}
          </Text>
          <Text position={[0, -0.32, 0.28]} fontSize={0.1} color="#eeeeee" anchorX="center" anchorY="middle" maxWidth={0.9} outlineWidth={0.004} outlineColor="#000000">
            {element.name}
          </Text>
        </>
      )}
      {isSelected && !dimmed && (
        <>
          <pointLight position={[0, 0, 1.5]} color={color} intensity={5} distance={4} decay={2} />
          <ElectronOrbit color={color} radius={0.8} speed={3} />
          <ElectronOrbit color={color} radius={0.65} speed={-2.5} tilt={Math.PI / 3} />
          <ElectronOrbit color={color} radius={0.5} speed={1.8} tilt={Math.PI / 1.5} />
        </>
      )}
      {hovered && !isSelected && !dimmed && (
        <pointLight position={[0, 0, 0.8]} color={color} intensity={3} distance={2.5} decay={2} />
      )}
    </group>
  );
}

function ElectronOrbit({ color, radius, speed, tilt = 0 }: { color: string; radius: number; speed: number; tilt?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed;
    ref.current.position.x = Math.cos(t) * radius;
    ref.current.position.y = Math.sin(t) * radius * Math.cos(tilt) + 0.6;
    ref.current.position.z = Math.sin(t) * radius * Math.sin(tilt);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

function FloatingParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 200;
  const data = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 25;
      arr[i * 3 + 2] = -3 - Math.random() * 15;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position.array as Float32Array;
    const t = clock.getElapsedTime();
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += Math.sin(t * 0.12 + i * 0.3) * 0.003;
      pos[i * 3] += Math.cos(t * 0.08 + i * 0.5) * 0.002;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[data, 3]} count={count} /></bufferGeometry>
      <pointsMaterial color="#6688cc" size={0.08} transparent opacity={0.5} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function BackdropRings() {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={ref} position={[0, 0, -8]}>
      {[6, 10, 14, 18, 22].map((r, i) => (
        <mesh key={i} rotation={[0, 0, i * 0.2]}>
          <ringGeometry args={[r, r + 0.03, 80]} />
          <meshBasicMaterial color={["#1a3a6a", "#2a1a5a", "#1a4a3a", "#3a2a1a", "#1a2a4a"][i]} transparent opacity={0.25 - i * 0.03} />
        </mesh>
      ))}
    </group>
  );
}

function NebulaClouds() {
  const ref = useRef<THREE.Group>(null);
  const clouds = useMemo(() => Array.from({ length: 8 }, () => ({
    pos: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 18, -6 - Math.random() * 10] as [number, number, number],
    scale: 2 + Math.random() * 4,
    color: ["#1a2a5a", "#2a1a4a", "#0a3a3a", "#3a1a2a"][Math.floor(Math.random() * 4)],
    speed: 0.02 + Math.random() * 0.03,
  })), []);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime();
      ref.current.children.forEach((child, i) => {
        child.position.x += Math.sin(t * clouds[i].speed + i) * 0.003;
        child.position.y += Math.cos(t * clouds[i].speed * 0.8 + i) * 0.002;
      });
    }
  });

  return (
    <group ref={ref}>
      {clouds.map((cloud, i) => (
        <mesh key={i} position={cloud.pos}>
          <sphereGeometry args={[cloud.scale, 16, 16]} />
          <meshBasicMaterial color={cloud.color} transparent opacity={0.08} />
        </mesh>
      ))}
    </group>
  );
}
