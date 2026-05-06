import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { CATEGORY_TREE, Level1Category, Level2Category } from "@/data/categoryData";
import { CATEGORIES } from "@/data/mockData";
import CategoryRow from "@/components/CategoryRow";

const SIDEBAR_WIDTH = 82;
const BANNER_HEIGHT = 120;
const CIRCLE_MAX = 96;

/* ── Unique image per L3 item ───────────────────────────────── */
const L3_IMAGES: Record<string, string> = {
  /* fashion-women */
  "fw-1": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=160&h=160&fit=crop&q=80",
  "fw-2": "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=160&h=160&fit=crop&q=80",
  "fw-3": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=160&h=160&fit=crop&q=80",
  "fw-4": "https://images.unsplash.com/photo-1518310383802-640c2de311b6?w=160&h=160&fit=crop&q=80",
  "fw-5": "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=160&h=160&fit=crop&q=80",
  "fw-6": "https://images.unsplash.com/photo-1570976447640-ac859083963f?w=160&h=160&fit=crop&q=80",
  /* fashion-men */
  "fm-1": "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=160&h=160&fit=crop&q=80",
  "fm-2": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=160&h=160&fit=crop&q=80",
  "fm-3": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=160&h=160&fit=crop&q=80",
  "fm-4": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&q=80",
  "fm-5": "https://images.unsplash.com/photo-1556906781-9a412961a24b?w=160&h=160&fit=crop&q=80",
  "fm-6": "https://images.unsplash.com/photo-1617952739367-a79ae2f15143?w=160&h=160&fit=crop&q=80",
  /* fashion-abayas */
  "fa-1": "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=160&h=160&fit=crop&q=80",
  "fa-2": "https://images.unsplash.com/photo-1610273736521-c3b9f7d8882d?w=160&h=160&fit=crop&q=80",
  "fa-3": "https://images.unsplash.com/photo-1583394293214-57f1a8a42f3f?w=160&h=160&fit=crop&q=80",
  "fa-4": "https://images.unsplash.com/photo-1576570173168-28572ddb8d8b?w=160&h=160&fit=crop&q=80",
  "fa-5": "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=160&h=160&fit=crop&q=80",
  /* fashion-kids */
  "fk-1": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=160&h=160&fit=crop&q=80",
  "fk-2": "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=160&h=160&fit=crop&q=80",
  "fk-3": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=160&h=160&fit=crop&q=80",
  "fk-4": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=160&h=160&fit=crop&q=80",
  /* fashion-sport */
  "fs-1": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=160&h=160&fit=crop&q=80",
  "fs-2": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=160&h=160&fit=crop&q=80",
  "fs-3": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=160&h=160&fit=crop&q=80",
  "fs-4": "https://images.unsplash.com/photo-1600679472829-3044539ce8ed?w=160&h=160&fit=crop&q=80",
  /* elec-phones */
  "ep-1": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=160&h=160&fit=crop&q=80",
  "ep-2": "https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=160&h=160&fit=crop&q=80",
  "ep-3": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=160&h=160&fit=crop&q=80",
  "ep-4": "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=160&h=160&fit=crop&q=80",
  "ep-5": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=160&h=160&fit=crop&q=80",
  /* elec-computers */
  "ec-1": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=160&h=160&fit=crop&q=80",
  "ec-2": "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=160&h=160&fit=crop&q=80",
  "ec-3": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=160&h=160&fit=crop&q=80",
  "ec-4": "https://images.unsplash.com/photo-1625723044792-44de16ccb4e9?w=160&h=160&fit=crop&q=80",
  "ec-5": "https://images.unsplash.com/photo-1597852074816-d933c7d2b988?w=160&h=160&fit=crop&q=80",
  /* elec-tv */
  "et-1": "https://images.unsplash.com/photo-1593359677879-a4bb92f4975f?w=160&h=160&fit=crop&q=80",
  "et-2": "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=160&h=160&fit=crop&q=80",
  "et-3": "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=160&h=160&fit=crop&q=80",
  "et-4": "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=160&h=160&fit=crop&q=80",
  /* elec-cameras */
  "eca-1": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=160&h=160&fit=crop&q=80",
  "eca-2": "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=160&h=160&fit=crop&q=80",
  "eca-3": "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=160&h=160&fit=crop&q=80",
  "eca-4": "https://images.unsplash.com/photo-1617957743107-a9b95b799cdf?w=160&h=160&fit=crop&q=80",
  /* elec-gaming */
  "eg-1": "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=160&h=160&fit=crop&q=80",
  "eg-2": "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=160&h=160&fit=crop&q=80",
  "eg-3": "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=160&h=160&fit=crop&q=80",
  "eg-4": "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=160&h=160&fit=crop&q=80",
  "eg-5": "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?w=160&h=160&fit=crop&q=80",
  /* elec-smarthome */
  "es-1": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=160&h=160&fit=crop&q=80",
  "es-2": "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=160&h=160&fit=crop&q=80",
  "es-3": "https://images.unsplash.com/photo-1558002038-1055907df827?w=160&h=160&fit=crop&q=80",
  "es-4": "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=160&h=160&fit=crop&q=80",
  /* home-furniture */
  "hf-1": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=160&h=160&fit=crop&q=80",
  "hf-2": "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=160&h=160&fit=crop&q=80",
  "hf-3": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=160&h=160&fit=crop&q=80",
  "hf-4": "https://images.unsplash.com/photo-1503602642458-232111445657?w=160&h=160&fit=crop&q=80",
  "hf-5": "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=160&h=160&fit=crop&q=80",
  /* home-kitchen */
  "hk-1": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=160&h=160&fit=crop&q=80",
  "hk-2": "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=160&h=160&fit=crop&q=80",
  "hk-3": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=160&h=160&fit=crop&q=80",
  "hk-4": "https://images.unsplash.com/photo-1603208851323-28d1b04e2b94?w=160&h=160&fit=crop&q=80",
  "hk-5": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=160&h=160&fit=crop&q=80",
  /* home-decor */
  "hd-1": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=160&h=160&fit=crop&q=80",
  "hd-2": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&h=160&fit=crop&q=80",
  "hd-3": "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=160&h=160&fit=crop&q=80",
  "hd-4": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=160&h=160&fit=crop&q=80",
  /* home-cleaning */
  "hc-1": "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=160&h=160&fit=crop&q=80",
  "hc-2": "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=160&h=160&fit=crop&q=80",
  "hc-3": "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=160&h=160&fit=crop&q=80",
  "hc-4": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=160&h=160&fit=crop&q=80",
  /* home-garden */
  "hg-1": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=160&h=160&fit=crop&q=80",
  "hg-2": "https://images.unsplash.com/photo-1416339306562-f3d12fefd36f?w=160&h=160&fit=crop&q=80",
  "hg-3": "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=160&h=160&fit=crop&q=80",
  "hg-4": "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=160&h=160&fit=crop&q=80",
  /* beauty-perfumes */
  "bp-1": "https://images.unsplash.com/photo-1541643600914-78b084683702?w=160&h=160&fit=crop&q=80",
  "bp-2": "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=160&h=160&fit=crop&q=80",
  "bp-3": "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=160&h=160&fit=crop&q=80",
  "bp-4": "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=160&h=160&fit=crop&q=80",
  /* beauty-makeup */
  "bm-1": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=160&h=160&fit=crop&q=80",
  "bm-2": "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=160&h=160&fit=crop&q=80",
  "bm-3": "https://images.unsplash.com/photo-1586495777744-4e6232bf2f9c?w=160&h=160&fit=crop&q=80",
  "bm-4": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=160&h=160&fit=crop&q=80",
  "bm-5": "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=160&h=160&fit=crop&q=80",
  /* beauty-skin */
  "bs-1": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=160&h=160&fit=crop&q=80",
  "bs-2": "https://images.unsplash.com/photo-1526758097130-bab247274f58?w=160&h=160&fit=crop&q=80",
  "bs-3": "https://images.unsplash.com/photo-1601049676869-702ea24cfd58?w=160&h=160&fit=crop&q=80",
  "bs-4": "https://images.unsplash.com/photo-1556228852-6d35a585d566?w=160&h=160&fit=crop&q=80",
  "bs-5": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=160&h=160&fit=crop&q=80",
  /* beauty-hair */
  "bh-1": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=160&h=160&fit=crop&q=80",
  "bh-2": "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=160&h=160&fit=crop&q=80",
  "bh-3": "https://images.unsplash.com/photo-1519500099198-fd81846b8f03?w=160&h=160&fit=crop&q=80",
  "bh-4": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=160&h=160&fit=crop&q=80",
  /* beauty-men */
  "bmen-1": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=160&h=160&fit=crop&q=80",
  "bmen-2": "https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=160&h=160&fit=crop&q=80",
  "bmen-3": "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=160&h=160&fit=crop&q=80",
  "bmen-4": "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=160&h=160&fit=crop&q=80",
  /* acc-watches */
  "aw-1": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=160&h=160&fit=crop&q=80",
  "aw-2": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=160&h=160&fit=crop&q=80",
  "aw-3": "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=160&h=160&fit=crop&q=80",
  "aw-4": "https://images.unsplash.com/photo-1557531365-e8b22d93dbd0?w=160&h=160&fit=crop&q=80",
  /* acc-bags */
  "ab-1": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=160&h=160&fit=crop&q=80",
  "ab-2": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=160&h=160&fit=crop&q=80",
  "ab-3": "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=160&h=160&fit=crop&q=80",
  "ab-4": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=160&h=160&fit=crop&q=80",
  "ab-5": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=160&h=160&fit=crop&q=80",
  /* acc-shoes */
  "as-1": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&h=160&fit=crop&q=80",
  "as-2": "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=160&h=160&fit=crop&q=80",
  "as-3": "https://images.unsplash.com/photo-1514590734052-344a18719611?w=160&h=160&fit=crop&q=80",
  "as-4": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=160&h=160&fit=crop&q=80",
  "as-5": "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=160&h=160&fit=crop&q=80",
  /* acc-jewelry */
  "aj-1": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=160&h=160&fit=crop&q=80",
  "aj-2": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=160&h=160&fit=crop&q=80",
  "aj-3": "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=160&h=160&fit=crop&q=80",
  "aj-4": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=160&h=160&fit=crop&q=80",
  "aj-5": "https://images.unsplash.com/photo-1573408301185-9519f94816f4?w=160&h=160&fit=crop&q=80",
  /* acc-glasses */
  "ag-1": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=160&h=160&fit=crop&q=80",
  "ag-2": "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=160&h=160&fit=crop&q=80",
  "ag-3": "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=160&h=160&fit=crop&q=80",
  /* acc-belts */
  "abe-1": "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=160&h=160&fit=crop&q=80",
  "abe-2": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=160&h=160&fit=crop&q=80",
  "abe-3": "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=160&h=160&fit=crop&q=80",
  /* sports */
  "sc-1": "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=160&h=160&fit=crop&q=80",
  "sc-2": "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=160&h=160&fit=crop&q=80",
  "sc-3": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&h=160&fit=crop&q=80",
  "sc-4": "https://images.unsplash.com/photo-1600679472829-3044539ce8ed?w=160&h=160&fit=crop&q=80",
  "sc-5": "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=160&h=160&fit=crop&q=80",
  "se-1": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=160&h=160&fit=crop&q=80",
  "se-2": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=160&h=160&fit=crop&q=80",
  "se-3": "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=160&h=160&fit=crop&q=80",
  "se-4": "https://images.unsplash.com/photo-1518644961665-ed172691aaa1?w=160&h=160&fit=crop&q=80",
  "ss-1": "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=160&h=160&fit=crop&q=80",
  "ss-2": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=160&h=160&fit=crop&q=80",
  "ss-3": "https://images.unsplash.com/photo-1623520676613-ea30a87a2de0?w=160&h=160&fit=crop&q=80",
  "ss-4": "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=160&h=160&fit=crop&q=80",
  "sp-1": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=160&h=160&fit=crop&q=80",
  "sp-2": "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=160&h=160&fit=crop&q=80",
  "sp-3": "https://images.unsplash.com/photo-1530549387789-4c1017266635?w=160&h=160&fit=crop&q=80",
  "sp-4": "https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=160&h=160&fit=crop&q=80",
  "sp-5": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=160&h=160&fit=crop&q=80",
  "so-1": "https://images.unsplash.com/photo-1551632811-561732d1e306?w=160&h=160&fit=crop&q=80",
  "so-2": "https://images.unsplash.com/photo-1527004013197-933b2c0e3e4f?w=160&h=160&fit=crop&q=80",
  "so-3": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=160&h=160&fit=crop&q=80",
  /* kids */
  "kt-1": "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=160&h=160&fit=crop&q=80",
  "kt-2": "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=160&h=160&fit=crop&q=80",
  "kt-3": "https://images.unsplash.com/photo-1607453998774-d533f65dac99?w=160&h=160&fit=crop&q=80",
  "kt-4": "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=160&h=160&fit=crop&q=80",
  "kt-5": "https://images.unsplash.com/photo-1560961911-ba7ef651a56c?w=160&h=160&fit=crop&q=80",
  "kc-1": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=160&h=160&fit=crop&q=80",
  "kc-2": "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=160&h=160&fit=crop&q=80",
  "kc-3": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=160&h=160&fit=crop&q=80",
  "kc-4": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=160&h=160&fit=crop&q=80",
  "ks-1": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=160&h=160&fit=crop&q=80",
  "ks-2": "https://images.unsplash.com/photo-1527345931282-806d3b11967f?w=160&h=160&fit=crop&q=80",
  "ks-3": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=160&h=160&fit=crop&q=80",
  "ks-4": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=160&h=160&fit=crop&q=80",
  "kb-1": "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=160&h=160&fit=crop&q=80",
  "kb-2": "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=160&h=160&fit=crop&q=80",
  "kb-3": "https://images.unsplash.com/photo-1584691702882-23ea0f01a78e?w=160&h=160&fit=crop&q=80",
  "kb-4": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=160&h=160&fit=crop&q=80",
  "kb-5": "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=160&h=160&fit=crop&q=80",
};

/* ── Banner data per L1 ──────────────────────────────────────── */
const BANNER_MAP: Record<string, { uri: string; subtitle: string }> = {
  fashion:     { uri: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=900&h=300&fit=crop&q=85", subtitle: "أحدث صيحات الموضة" },
  electronics: { uri: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=900&h=300&fit=crop&q=85", subtitle: "أجهزة وتقنيات متطورة" },
  accessories: { uri: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=900&h=300&fit=crop&q=85", subtitle: "إكسسوارات فاخرة ومميزة" },
  beauty:      { uri: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=900&h=300&fit=crop&q=85", subtitle: "العناية بالجمال والأناقة" },
  home:        { uri: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&h=300&fit=crop&q=85", subtitle: "أثاث وديكور راقي" },
  sports:      { uri: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=900&h=300&fit=crop&q=85", subtitle: "رياضة ولياقة بدنية" },
  kids:        { uri: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=900&h=300&fit=crop&q=85", subtitle: "ألعاب وملابس الأطفال" },
};

/* ── L1 tab item (animated circle) ──────────────────────────── */
function L1TabItem({
  cat,
  isSelected,
  onSelect,
}: {
  cat: Level1Category;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(isSelected ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isSelected ? 1.1 : 1,
      useNativeDriver: true,
      damping: 12,
      stiffness: 200,
      mass: 0.8,
    }).start();
  }, [isSelected]);

  return (
    <View style={styles.tabItem}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          style={({ pressed }) => [
            styles.tabCircle,
            {
              backgroundColor: isSelected ? cat.color : cat.bgColor,
              borderColor: isSelected ? cat.color : `${cat.color}40`,
              opacity: pressed ? 0.72 : 1,
            },
          ]}
          onPress={() => onSelect(cat.id)}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
        >
          <Ionicons name={cat.icon as any} size={24} color={isSelected ? "#fff" : cat.color} />
        </Pressable>
      </Animated.View>
      <Text
        style={[styles.tabLabel, { color: isSelected ? cat.color : colors.text }]}
        numberOfLines={1}
      >
        {cat.nameAr}
      </Text>
    </View>
  );
}

/* ── L1 horizontal tab strip ─────────────────────────────────── */
function L1TabStrip({ selectedId, onSelect }: { selectedId: string; onSelect: (id: string) => void }) {
  const colors = useColors();
  return (
    <View style={{ backgroundColor: colors.card }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabScrollView, Platform.OS === "web" && ({ direction: "rtl" } as any)]}
        contentContainerStyle={styles.tabStrip}
      >
        {CATEGORY_TREE.map((cat) => (
          <L1TabItem key={cat.id} cat={cat} isSelected={cat.id === selectedId} onSelect={onSelect} />
        ))}
      </ScrollView>
      <View style={[styles.tabStripBorder, { backgroundColor: colors.border }]} />
    </View>
  );
}

/* ── Rich banner with gradient overlay + title + CTA ─────────── */
function RichBanner({ l1 }: { l1: Level1Category }) {
  const colors = useColors();
  const totalProducts = l1.subCategories.reduce((s, sub) => s + sub.productCount, 0);
  const bannerData = BANNER_MAP[l1.id] ?? BANNER_MAP["fashion"];

  return (
    <View style={bannerStyles.wrapper}>
      <Image source={{ uri: bannerData.uri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
      <View style={[bannerStyles.gradient, { backgroundColor: `${l1.color}CC` }]} />
      <View style={bannerStyles.content}>
        <View style={bannerStyles.textBlock}>
          <Text style={bannerStyles.title}>{l1.nameAr}</Text>
          <Text style={bannerStyles.subtitle}>{bannerData.subtitle}</Text>
          <Text style={bannerStyles.count}>
            {totalProducts.toLocaleString("ar-SA")} منتج
          </Text>
        </View>
        <TouchableOpacity
          style={[bannerStyles.cta, { backgroundColor: "#fff" }]}
          onPress={() => router.push(`/(tabs)/search?category=${l1.id}` as any)}
          activeOpacity={0.8}
        >
          <Text style={[bannerStyles.ctaText, { color: l1.color }]}>تصفح الكل</Text>
          <Ionicons name="arrow-back" size={13} color={l1.color} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const bannerStyles = StyleSheet.create({
  wrapper: {
    height: BANNER_HEIGHT,
    overflow: "hidden",
    backgroundColor: "#ddd",
    marginHorizontal: 8,
    borderRadius: 14,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
      android: { elevation: 4 },
      web:     { boxShadow: "0 4px 14px rgba(0,0,0,0.15)" } as any,
    }),
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.72,
  },
  content: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textBlock: { alignItems: "flex-end", gap: 2, flex: 1 },
  title: {
    color: "#fff",
    fontSize: 17,
    fontFamily: "Cairo_800ExtraBold",
    textAlign: "right",
  },
  subtitle: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 11,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
  },
  count: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 10,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
    marginTop: 2,
  },
  cta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
      android: { elevation: 2 },
      web:     { boxShadow: "0 2px 6px rgba(0,0,0,0.12)" } as any,
    }),
  },
  ctaText: {
    fontSize: 12,
    fontFamily: "Cairo_700Bold",
  },
});

/* ── L2 sidebar item ─────────────────────────────────────────── */
function L2SidebarItem({
  sub,
  isSelected,
  onPress,
}: {
  sub: Level2Category;
  isSelected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.sidebarItem,
        isSelected && {
          backgroundColor: `${sub.color}12`,
          borderRightWidth: 3,
          borderRightColor: sub.color,
        },
      ]}
    >
      <View
        style={[
          styles.sidebarIconWrap,
          { backgroundColor: isSelected ? sub.bgColor : `${sub.color}15` },
        ]}
      >
        <Ionicons
          name={sub.icon as any}
          size={17}
          color={isSelected ? sub.color : colors.mutedForeground}
        />
      </View>
      <Text
        style={[
          styles.sidebarLabel,
          {
            color: isSelected ? sub.color : colors.mutedForeground,
            fontFamily: isSelected ? "Cairo_700Bold" : "Cairo_400Regular",
          },
        ]}
        numberOfLines={2}
      >
        {sub.nameAr}
      </Text>
      <View style={[styles.sidebarBadge, { backgroundColor: isSelected ? sub.color : `${sub.color}25` }]}>
        <Text style={[styles.sidebarBadgeText, { color: isSelected ? "#fff" : sub.color }]}>
          {sub.productCount >= 1000
            ? `${(sub.productCount / 1000).toFixed(1)}k`
            : sub.productCount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/* ── L3 circle card ──────────────────────────────────────────── */
function L3CircleCard({
  item,
  parentSub,
  circleSize,
  onPress,
}: {
  item: { id: string; nameAr: string };
  parentSub: Level2Category;
  circleSize: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const r = circleSize / 2;
  const imgUri = L3_IMAGES[item.id];

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.9, useNativeDriver: true, damping: 15, stiffness: 300 }).start();
  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, damping: 15, stiffness: 300 }).start();

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[styles.subCard, { width: circleSize }]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <View
          style={[
            styles.subCircle,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: r,
              backgroundColor: parentSub.bgColor,
              borderColor: `${parentSub.color}30`,
            },
          ]}
        >
          {imgUri ? (
            <Image
              source={{ uri: imgUri }}
              style={{ width: circleSize, height: circleSize, borderRadius: r }}
              resizeMode="cover"
            />
          ) : (
            <Ionicons
              name={parentSub.icon as any}
              size={Math.round(circleSize * 0.38)}
              color={parentSub.color}
            />
          )}
        </View>
      </Animated.View>
      <Text style={[styles.subName, { color: colors.text }]} numberOfLines={2}>
        {item.nameAr}
      </Text>
    </TouchableOpacity>
  );
}

/* ── Content area header ─────────────────────────────────────── */
function ContentHeader({ sub, l1Id }: { sub: Level2Category; l1Id: string }) {
  const colors = useColors();
  return (
    <View style={[styles.contentHeader, { backgroundColor: `${sub.color}0D`, borderBottomColor: `${sub.color}25` }]}>
      <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, flex: 1 }}>
        <View style={[styles.contentHeaderIcon, { backgroundColor: sub.bgColor }]}>
          <Ionicons name={sub.icon as any} size={14} color={sub.color} />
        </View>
        <View style={{ alignItems: "flex-end", flex: 1 }}>
          <Text style={[styles.contentHeaderText, { color: colors.text }]}>{sub.nameAr}</Text>
          <Text style={[styles.contentHeaderCount, { color: colors.mutedForeground }]}>
            {sub.productCount.toLocaleString("ar-SA")} منتج
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.browseAllBtn, { backgroundColor: sub.color }]}
        onPress={() => router.push(`/(tabs)/search?category=${l1Id}` as any)}
        activeOpacity={0.8}
      >
        <Text style={styles.browseAllText}>تصفح الكل</Text>
        <Ionicons name="arrow-back" size={11} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/* ── Main screen ─────────────────────────────────────────────── */
export default function CategoriesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const topPad    = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 68;

  const contentWidth = width - SIDEBAR_WIDTH;
  const cols = 4;
  const rawCircle = Math.floor((contentWidth - 24 - (cols - 1) * 10) / cols);
  const circleSize = Math.min(rawCircle, CIRCLE_MAX);

  const [selectedL1Id, setSelectedL1Id] = useState(CATEGORY_TREE[0].id);
  const [selectedL2Id, setSelectedL2Id] = useState(CATEGORY_TREE[0].subCategories[0].id);

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fadeInContent = useCallback(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const selectedL1 = useMemo(
    () => CATEGORY_TREE.find((c) => c.id === selectedL1Id) ?? CATEGORY_TREE[0],
    [selectedL1Id]
  );

  const selectedL2 = useMemo(
    () =>
      selectedL1.subCategories.find((s) => s.id === selectedL2Id) ??
      selectedL1.subCategories[0],
    [selectedL1, selectedL2Id]
  );

  const handleSelectL1 = useCallback((id: string) => {
    setSelectedL1Id(id);
    const l1 = CATEGORY_TREE.find((c) => c.id === id);
    if (l1?.subCategories[0]) setSelectedL2Id(l1.subCategories[0].id);
    fadeInContent();
  }, [fadeInContent]);

  const handleSelectL2 = useCallback((id: string) => {
    setSelectedL2Id(id);
    fadeInContent();
  }, [fadeInContent]);

  const s = useMemo(
    () =>
      StyleSheet.create({
        container:  { flex: 1, backgroundColor: colors.background },
        searchHeader: {
          backgroundColor: colors.background,
          paddingTop: topPad + 6,
          paddingHorizontal: 12,
          paddingBottom: 8,
        },
        searchBar: {
          flexDirection: "row-reverse",
          alignItems: "center",
          backgroundColor: colors.card,
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: `${colors.border}70`,
          gap: 8,
          ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
            android: { elevation: 2 },
            web: { boxShadow: "0 2px 4px rgba(0,0,0,0.06)" } as any,
          }),
        },
        searchText: {
          flex: 1,
          fontSize: 13,
          fontFamily: "Cairo_400Regular",
          color: colors.mutedForeground,
          textAlign: "right",
          writingDirection: "rtl",
        },
        banner:     { paddingTop: 8, paddingBottom: 8 },
        body:       { flex: 1, position: "relative" },
        sidebar: {
          position: "absolute",
          top: 0, right: 0, bottom: 0,
          width: SIDEBAR_WIDTH,
          backgroundColor: colors.secondary,
          borderLeftWidth: StyleSheet.hairlineWidth,
          borderLeftColor: colors.border,
          zIndex: 1,
        },
        content: {
          flex: 1,
          paddingRight: SIDEBAR_WIDTH,
          backgroundColor: colors.background,
        },
        grid: {
          flexDirection: "row-reverse",
          flexWrap: "wrap",
          paddingHorizontal: 12,
          gap: 10,
          paddingTop: 12,
          paddingBottom: bottomPad + 8,
          justifyContent: "flex-start",
        },
      }),
    [colors, bottomPad]
  );

  return (
    <View style={s.container}>
      {/* ── Pinned search bar (same design as home page) ── */}
      <View style={s.searchHeader}>
        <TouchableOpacity
          style={s.searchBar}
          onPress={() => router.push("/(tabs)/search")}
          activeOpacity={0.8}
          accessibilityLabel="البحث"
          accessibilityRole="button"
        >
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <Text style={s.searchText}>ابحث عن منتجات، ماركات...</Text>
          <Ionicons name="mic" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <CategoryRow
        categories={CATEGORIES.filter((c) => c.id !== "all")}
        selected={selectedL1Id}
        onSelect={handleSelectL1}
      />

      <View style={s.banner}>
        <RichBanner l1={selectedL1} />
      </View>

      <View style={s.body}>
        <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
          <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
            <ContentHeader sub={selectedL2} l1Id={selectedL1Id} />
            <View style={s.grid}>
              {selectedL2.items.map((item) => (
                <L3CircleCard
                  key={item.id}
                  item={item}
                  parentSub={selectedL2}
                  circleSize={circleSize}
                  onPress={() => router.push(`/(tabs)/search?category=${selectedL1Id}` as any)}
                />
              ))}
            </View>
          </ScrollView>
        </Animated.View>

        <ScrollView
          style={s.sidebar}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 6 }}
        >
          {selectedL1.subCategories.map((sub) => (
            <L2SidebarItem
              key={sub.id}
              sub={sub}
              isSelected={sub.id === selectedL2.id}
              onPress={() => handleSelectL2(sub.id)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

/* ─────────────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  /* L1 tab strip */
  tabScrollView: { paddingVertical: 4 },
  tabStrip: { paddingHorizontal: 16, gap: 2 },
  tabItem: { alignItems: "center", gap: 4, width: 60 },
  tabCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 3 },
      web:     { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } as any,
    }),
  },
  tabLabel: {
    fontSize: 9,
    fontFamily: "Cairo_700Bold",
    textAlign: "center",
    width: 60,
  },
  tabStripBorder: { height: StyleSheet.hairlineWidth, marginHorizontal: 12 },

  /* L2 sidebar */
  sidebarItem: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    width: SIDEBAR_WIDTH,
    borderRightWidth: 3,
    borderRightColor: "transparent",
  },
  sidebarIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  sidebarLabel: {
    fontSize: 9,
    textAlign: "center",
    lineHeight: 13,
  },
  sidebarBadge: {
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 28,
    alignItems: "center",
  },
  sidebarBadgeText: {
    fontSize: 8,
    fontFamily: "Cairo_700Bold",
  },

  /* Content header */
  contentHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 1,
  },
  contentHeaderIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  contentHeaderText: {
    textAlign: "right",
    fontSize: 13,
    fontFamily: "Cairo_700Bold",
    lineHeight: 18,
  },
  contentHeaderCount: {
    fontSize: 10,
    fontFamily: "Cairo_400Regular",
    textAlign: "right",
  },
  browseAllBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },
  browseAllText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "Cairo_700Bold",
  },

  /* L3 circle card */
  subCard: { alignItems: "center", paddingBottom: 4 },
  subCircle: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 6,
    ...Platform.select({
      ios:     { shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 },
      web:     { boxShadow: "0 3px 10px rgba(0,0,0,0.1)" } as any,
    }),
  },
  subName: {
    fontSize: 11,
    fontFamily: "Cairo_600SemiBold",
    textAlign: "center",
    lineHeight: 16,
  },
});
