import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import LazyImage from "../../common/LazyImage";
import { projectService } from "../../service/projectService";
import * as offlineStorage from "../../utils/offlineStorage";

const COVER_TEMPLATES = {
  simple: [
    {
      id: "label",
      name: "Label",
      color: "#E3F2FD",
      gradient: ["#E3F2FD", "#BBDEFB"],
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764233916/btusu1zbeoud1etoxq5c.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764233917/oxz0ypap4xjek1ta54lp.jpg",
      },
    },
    {
      id: "title_tag",
      name: "Title tag",
      color: "#BBDEFB",
      gradient: ["#BBDEFB", "#90CAF9"],
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764233953/fhxyuei6yffg7baelvx7.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764233955/zngyeb73bx2epg3fa6yp.jpg",
      },
    },
    {
      id: "rouge",
      name: "Rouge",
      color: "#F8BBD0",
      gradient: ["#F8BBD0", "#F48FB1"],
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764234000/c7kl3wsr16xuwodiwqfz.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764234001/kl58mljuyjvmen0dt280.jpg",
      },
    },
    {
      id: "autumn_waves",
      name: "Autumn waves",
      color: "#B3E5FC",
      gradient: ["#B3E5FC", "#81D4FA"],
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764234033/jbaj5jyyphk4hx1elq7m.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764234031/qstpvqobvzvkikeqcgue.jpg",
      },
    },
    {
      id: "eggplant_flower",
      name: "Eggplant flower",
      color: "#E1BEE7",
      gradient: ["#E1BEE7", "#CE93D8"],
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764234149/jvycbksw1ynmv5komnsg.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764234146/krqllmdq6kbxn5jkfwnq.jpg",
      },
    },
    {
      id: "half_seen",
      name: "Half seen",
      color: "#FFE0B2",
      gradient: ["#FFE0B2", "#FFCC80"],
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764234210/du3k0tyggpoibqgufoni.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764234212/qzi19g89k4sf7atjpcze.jpg",
      },
    },
    {
      id: "amber",
      name: "Amber",
      color: "#FFCC80",
      gradient: ["#FFCC80", "#FFB74D"],
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764234208/u4fg0k0ytsteekjglx90.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764234205/u7ucfeqcuqyxoyqbkbtu.jpg",
      },
    },
  ],
  graph: [
    {
      id: "nightfall",
      name: "Nightfall",
      color: "#263238",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764231819/qkeei7kccmyf5qsly0f5.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764231819/jww6yjg8t3qdaunsbfbb.jpg",
      },
    },
    {
      id: "sunrise",
      name: "Sunrise",
      color: "#FFF3E0",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764231912/tnikfwiiuxcgqzzlakgs.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764231911/fki8b2jg56a9mhdbgmft.jpg",
      },
    },
    {
      id: "sunset_a",
      name: "Sunset",
      color: "#FFE0B2",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764231957/frh0cdbya4d8chui0xmz.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764231958/jd9p4mevjwsr7igtfvrp.jpg",
      },
    },
    {
      id: "iceberg",
      name: "Iceberg",
      color: "#E1F5FE",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764231993/liyctwkmuyuqmvnffpxa.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764231995/x0v6rzvneriqbpnrcljg.jpg",
      },
    },
    {
      id: "afterglow",
      name: "Afterglow",
      color: "#FCE4EC",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764232090/hedh0neu2xzrik1p0fuw.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764232091/nzrky0womrfacnpszxsm.jpg",
      },
    },
    {
      id: "hills",
      name: "Hills",
      color: "#E0E0E0",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764232129/iq89kssbnexukfq7wryl.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764232130/ynkwufo6fj1kaypbbe4c.jpg",
      },
    },
    {
      id: "mountain_peak",
      name: "Mountain peak",
      color: "#E8EAF6",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764232176/omqoibkiz0xnqnx3i3c9.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764232178/mcaattyd2x946brauwcu.jpg",
      },
    },
    {
      id: "plain",
      name: "Plain",
      color: "#FAFAFA",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764232215/meu8n6tdbuhxg7kkkznf.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764232213/etj78mgr2jkezk1xno6t.jpg",
      },
    },
    {
      id: "desert",
      name: "Desert",
      color: "#F5F5F5",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764232266/vcwqpolfjog6dnf0kvv7.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764232268/h3sgcfibwpggxcimhqrt.jpg",
      },
    },
    {
      id: "sunset_b",
      name: "Sunset",
      color: "#FFE0B2",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764232299/kfgfpzoshqqv23c5rm1d.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764232301/gkdj1hrlyluidrrlgwih.jpg",
      },
    },
  ],
  fruit: [
    {
      id: "lychee",
      name: "Lychee",
      color: "#F8BBD0",
      emoji: "🍑",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/lxjin83oc1j4ybuhyumk.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/rpidw4lr8jhribajfhbz.jpg",
      },
    },
    {
      id: "pineapple",
      name: "Pineapple",
      color: "#FFF9C4",
      emoji: "🍍",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982339/snz4ype1qqt6gpoe3zb2.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982339/nkn8ymvheqvfo3th0u0p.jpg",
      },
    },
    {
      id: "orange",
      name: "Orange",
      color: "#FFE0B2",
      emoji: "🍊",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761983056/y5zdbialfifmznufcplx.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/vzopf1domdwbkldpsdn5.jpg",
      },
    },
    {
      id: "strawberry",
      name: "Strawberry",
      color: "#FFCDD2",
      emoji: "🍓",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/neexgy8ewglqna4qd6sd.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/itic068ggqj1tnfl36ne.jpg",
      },
    },
    {
      id: "valencia_orange",
      name: "Valencia orange",
      color: "#FFB74D",
      emoji: "🍊",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/tddrogjmjmeqj0xov1q1.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982338/trtigisvxb5fgdh4gpc0.jpg",
      },
    },
    {
      id: "explosive_lime",
      name: "Explosive lime",
      color: "#C5E1A5",
      emoji: "🍋",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982339/r6yrrenqvfnsplvytirm.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982339/pdivxn4z1mtmix6zxlul.jpg",
      },
    },
    {
      id: "watermelon",
      name: "Watermelon",
      color: "#EF9A9A",
      emoji: "🍉",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/fqkg0cp6qemlicbvg2fo.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761983398/sng1fsx9lzm8atnwlzd9.jpg",
      },
    },
    {
      id: "banana",
      name: "Banana",
      color: "#FFF59D",
      emoji: "🍌",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982339/q6gsrdtbowpkwvjgaxtj.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982339/jnbaj6nwo2ho9mbgyuuv.jpg",
      },
    },
    {
      id: "cherry",
      name: "Cherry",
      color: "#F48FB1",
      emoji: "🍒",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984664/ol9i6rmkhkloj2di7jz4.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984663/kpsv6ampqddvmeq6zorj.jpg",
      },
    },
    {
      id: "cream_a",
      name: "Cream A",
      color: "#F8BBD0",
      emoji: "🍰",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984663/gtdwiue4xx5lekruhiac.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984663/tzdjw2mscgkmjqobspfw.jpg",
      },
    },
    {
      id: "cream_b",
      name: "Cream B",
      color: "#F8BBD0",
      emoji: "🍰",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984663/fykfkrjvfnm91nwozfzg.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984663/wfxjjcj0eaqyub6leetj.jpg",
      },
    },
    {
      id: "cream_c",
      name: "Cream C",
      color: "#F8BBD0",
      emoji: "🍰",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984663/b0ksxbp4dznysdowig3z.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761984662/qysr6m2irqb3svmswcdb.jpg",
      },
    },
  ],
  illustration: [
    {
      id: "floral_jacket",
      name: "Floral jacket",
      color: "#FFE0B2",
      icon: "flower",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981187/kxqhlz190qzzyrgtdohk.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981187/hgr0cqabrjfioexq2l2k.jpg",
      },
    },
    {
      id: "pipi",
      name: "Pipi",
      color: "#C8E6C9",
      icon: "heart",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981336/dtxdbd3jzumvaxgh1wid.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981336/zamgtde7xmcinjjgedvh.jpg",
      },
    },
    {
      id: "ginger_cat",
      name: "Ginger cat",
      color: "#FFCC80",
      icon: "cat",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981513/g0hdfj1wwxea5r1ocdtz.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981513/dgqc5gegldx248rbmum1.jpg",
      },
    },
    {
      id: "variegated",
      name: "Variegated",
      color: "#C5E1A5",
      icon: "flower",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981948/cjmsadethztd3ctokxap.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981948/cycczfidxa2vqvhtzush.jpg",
      },
    },
    {
      id: "colorful",
      name: "Colorful",
      color: "#FFF9C4",
      icon: "palette",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981947/czsqduut0dgnadvrtrmw.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761981947/m90x48eswnj2fe6t41sj.jpg",
      },
    },
    {
      id: "black_cloud",
      name: "Black cloud",
      color: "#CFD8DC",
      icon: "cloud",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982208/ijgxkotnqtpvudm8pjgv.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982337/dvrkeml9p9xlkvprgl1n.jpg",
      },
    },
    {
      id: "finger_held",
      name: "Finger-held",
      color: "#B3E5FC",
      icon: "hand-pointing-up",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982593/mefjt7tim4nwtmz0nqb5.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982593/ytgbn7a4aaja3yxs7y2c.jpg",
      },
    },
    {
      id: "book_glued",
      name: "Book glued",
      color: "#F8BBD0",
      icon: "book-heart",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/zx7yoegpwk4qdehwpnu5.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/yd6q83gjojpggcegio2c.jpg",
      },
    },
    {
      id: "read_fly",
      name: "Read fly",
      color: "#C8E6C9",
      icon: "book",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/cr3r7tmi5dp80z97jelh.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/k99ne7mqjwjhaniiohvb.jpg",
      },
    },
    {
      id: "book_wings",
      name: "Book wings",
      color: "#FFE0B2",
      icon: "book-open-variant",
      imageUrl: {
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/zx7yoegpwk4qdehwpnu5.jpg",
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1761982340/yd6q83gjojpggcegio2c.jpg",
      },
    },
  ],
  blackandwhite: [
    {
      id: "sail_ocean",
      name: "Sail the ocean",
      color: "#ECEFF1",
      icon: "sail-boat",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224484/d5wld2lwskmbho8frrph.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224485/skiiraktirovhtaopgwo.jpg",
      },
    },
    {
      id: "soar_high",
      name: "Soar high",
      color: "#F5F5F5",
      icon: "airplane",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224680/ded1h2abadnjjpmwkn6s.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224680/j3omjhxyerbm0smzlyyc.jpg",
      },
    },
    {
      id: "brave_storms",
      name: "Brave Storms",
      color: "#E0E0E0",
      icon: "weather-lightning",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224737/wlgg4zpugku6mmh7cztg.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224737/qoaotobmroiyotozncyh.jpg",
      },
    },
    {
      id: "spring_air",
      name: "Spring in the air",
      color: "#FAFAFA",
      icon: "flower-tulip",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224827/ca7hh5we370ogiqicgfy.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224827/v4xbrswqgoozyo9mzlcx.jpg",
      },
    },
    {
      id: "swift_rabbit",
      name: "Swift rabbit",
      color: "#EEEEEE",
      icon: "rabbit",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224884/a1vhlboqjufyevfmdodp.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224885/sssvxhovsahhbprck0gy.jpg",
      },
    },
    {
      id: "bunny_family",
      name: "Bunny family",
      color: "#F5F5F5",
      icon: "rabbit-variant",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224919/cuitpftvmedbivszueiu.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224919/e51fhqqddtkycb4qgtyh.jpg",
      },
    },
    {
      id: "hoppy_play",
      name: "Hoppy play",
      color: "#E0E0E0",
      icon: "run",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224967/mv0pqhofal728v8njpdi.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764224967/ge0ggydwujl1yzc091kh.jpg",
      },
    },
    {
      id: "moonlit_hare",
      name: "Moonlit hare",
      color: "#263238",
      icon: "moon-waning-crescent",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225029/j00y5ogqyxunquxod9dj.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225029/pc3tpxacpv2ldusk0bzq.jpg",
      },
    },
    {
      id: "cub_fishing",
      name: "Cub fishing",
      color: "#CFD8DC",
      icon: "fish",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225254/gtejb326e8hgdqzoawfk.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225255/ouuchwo9llk026uywizn.jpg",
      },
    },
    {
      id: "cub_cruiser",
      name: "Cub cruiser",
      color: "#E0E0E0",
      icon: "car",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225135/wjptwygdzpp88tdptebh.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225135/pefktzzrwnjvygznmkqi.jpg",
      },
    },
    {
      id: "moon_sail",
      name: "Moon sail",
      color: "#E0E0E0",
      icon: "moon-waxing-crescent",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225291/vyeac4vdyrssetkdhza9.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225292/pqgj51ixx9oi7lzdgwda.jpg",
      },
    },
    {
      id: "touch_stars",
      name: "Touch stars",
      color: "#E0E0E0",
      icon: "star-shooting",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225368/cobvkvkk54ncrhsmode4.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225366/v25cd8o3l14bihebtgpq.jpg",
      },
    },
    {
      id: "hearts_align",
      name: "Hearts align",
      color: "#E0E0E0",
      icon: "heart",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225422/uummjcmge6hhdpthajro.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225421/vwuq7isacj04ybagrztd.jpg",
      },
    },
    {
      id: "breach_wave",
      name: "Breach wave",
      color: "#E0E0E0",
      icon: "wave",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225563/zx3ld5m8odhllbadgihm.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225563/nto7vwpkbcrzv2k0jgx7.jpg",
      },
    },
    {
      id: "celestial_gaze",
      name: "Celestial gaze",
      color: "#E0E0E0",
      icon: "eye",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225537/k2qnohwzuz3kf5puefoa.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764225537/jk4ngthcwtsdf7ilkopy.jpg",
      },
    },
  ],
};

const PAPER_TEMPLATES = {
  base: [
    {
      id: "blank",
      name: "Blank",
      icon: "rectangle-outline",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764235834/jzm0nh85eivj3d4vzhns.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764235833/w3aawtzywnmcgxau3e64.jpg",
      },
    },
    {
      id: "thin_line",
      name: "Thin line",
      icon: "format-line-spacing",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764235725/h8hqssaak1fomaghx0e7.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764235726/cusoh9ryzmme3juwycih.jpg",
      },
    },
    {
      id: "bold_line",
      name: "Bold line",
      icon: "format-line-weight",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764235797/lndxatfabalaoal2xpld.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764235793/zzjajibhl7soroeon6g9.jpg",
      },
    },
    {
      id: "mini_check",
      name: "Mini check",
      icon: "grid",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764235781/v478g6vakx1mj5azryjk.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764235782/e6j1mez53fjacbmlxvlx.jpg",
      },
    },
    {
      id: "mid_check",
      name: "Mid check",
      icon: "grid",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764236135/snfjyeziduko7mprvh4a.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764235785/ox5awh7zfaisxuwks6yb.jpg",
      },
    },
    {
      id: "dot_grid",
      name: "Dot grid",
      icon: "dots-grid",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764236217/be23nac1p9oetblpjf2s.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764236219/ofirjcua2cck9sj8w3fh.jpg",
      },
    },
  ],
  study: [
    {
      id: "cornell_a",
      name: "Cornell A",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764241655/rsjrx59dm8jkz0bobrmy.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764241655/am76uies5n0npaczkvz6.jpg",
      },
    },
    {
      id: "cornell_b",
      name: "Cornell B",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764241654/twzvtgjcmdgpuwuktpxj.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764241655/qq47ojsf49rx7hivtn0u.jpg",
      },
    },
    {
      id: "cornell_c",
      name: "Cornell C",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764241654/ov9s4o5hmoqpxfuqtywi.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764241654/y840jbbxtnh6gc1xi6ge.jpg",
      },
    },
    {
      id: "ebbinghaus",
      name: "Ebbinghaus",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764241884/b9elqykax1eihw6ufujo.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764241884/uyfpazufgpclgsymw0cz.jpg",
      },
    },
    {
      id: "todai",
      name: "Todai",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764242157/dlnh0hh9hfq1nfyxdiwo.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764242053/dpcebxe5a7fsgoqigtju.jpg",
      },
    },
    {
      id: "error_log_a",
      name: "Error log A",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764243482/iczmgrcsj1zgjrr0rwyk.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764243482/jhb2ihvvdmegmj267dwo.jpg",
      },
    },
    {
      id: "error_log_b",
      name: "Error log B",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764243759/l3a6cvfnluryuulof1oz.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764243482/f5cpfcbezw2zkavzdkqi.jpg",
      },
    },
    {
      id: "accenture",
      name: "Accenture",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764242102/wmewot4rti2pdxcxkxu0.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764242053/pndjgcwkhmvntffcbh2m.jpg",
      },
    },
    {
      id: "reading_note",
      name: "Reading note",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764243844/mccchpt2vglwyenewrfa.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764243847/t4sbpblzouokmmyolofi.jpg",
      },
    },
    {
      id: "class_schedule",
      name: "Class schedule",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764243903/ffwwus3fdrqvxhl0myji.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764243901/vx9y7ecrssl7ic7y9dbn.jpg",
      },
    },
    {
      id: "writing_pad",
      name: "Writing pad",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764243937/elxhruhrpysyygvx29f6.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764243938/htty3j5pxzkojcgkedeq.jpg",
      },
    },
  ],
  plan: [
    {
      id: "daily_todo",
      name: "Daily to-do",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764340262/t8jno7cbejqet1oc7ysp.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764340263/v5azi3n7dtspegvkl1jo.jpg",
      },
    },
    {
      id: "time_plan",
      name: "Time plan",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764340586/zart7joczrvs1sxqjexy.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764340586/nv7c1vlgazza6plhlqsv.jpg",
      },
    },
    {
      id: "study_plan",
      name: "Study plan",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764340700/fe7i6w3s1qytrwfznt2v.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764340700/zacpsvhylipahqbmigpm.jpg",
      },
    },
    {
      id: "task_list",
      name: "Task list",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764340778/iczhlptzjhasnm48vo6u.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764340779/ttrojzdakfvlvy6z1nei.jpg",
      },
    },
    {
      id: "todo_list",
      name: "To-do list",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764340941/rxtxwky12v09vy0wcde3.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764340941/iby9vmvpmij14fym5j2i.jpg",
      },
    },
    {
      id: "daily_planner",
      name: "Daily planner",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764341005/qevatd7tguh9bxttetvj.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764341005/lb1kqyhezzal5zyqr4bk.jpg",
      },
    },
    {
      id: "weekly_schedule",
      name: "Weekly schedule",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764342199/jqwt83q3i3k5njyckdmb.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764342199/m1w1dl2nsd7vtzxzykqu.jpg",
      },
    },
    {
      id: "monthly_planner",
      name: "Monthly planner",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764342327/nzvoq2vioon6f6mr1mpj.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764342327/nf7mdax5jznxdo9fjvbq.jpg",
      },
    },
    {
      id: "annual_schedule",
      name: "Annual schedule",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764342610/vjrzhlprxqpjge6oqbxf.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764342609/sdit4eorgyphkf6szgsx.jpg",
      },
    },
  ],
  work: [
    {
      id: "summary_a",
      name: "Summary A",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764344486/frtwsbsozaeh0owercgw.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764344487/mzptpibemcikajmrpsyn.jpg",
      },
    },
    {
      id: "summary_b",
      name: "Summary B",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764344713/hi9z1cvrx7azabpizlu3.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764344712/tlxkrpyjangqrzfpdqzo.jpg",
      },
    },
    {
      id: "lesson_plan",
      name: "Lesson plan",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764344830/gygm7a0ynil1nnqmb8rk.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764344830/jwaw8idc96vujmjur8iz.jpg",
      },
    },
    {
      id: "swot",
      name: "SWOT",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764344904/e5lwca2nibr1x6lwmhn5.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764344903/rpqtn9hn5cptoteihvxe.jpg",
      },
    },
    {
      id: "four_quadrants",
      name: "Four quadrants",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764344951/ehy4jorek8lzrf8ks2cz.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764344950/hnoydwzovnky0xtagdgn.jpg",
      },
    },
    {
      id: "law_file",
      name: "Law file",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764345306/sxoi3gdx1wufiaydhvzz.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764345306/tsqklvq4xt23xmtcyhy3.jpg",
      },
    },
  ],
  write: [
    {
      id: "four_line_paper",
      name: "4-line paper",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764348380/otryn108uxtrjdppuelu.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764348380/urinrhli6ouiertevtgh.jpg",
      },
    },
    {
      id: "graph_paper",
      name: "Graph paper",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764348548/qvun3qhntb11u0dman64.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764348547/aqjxptie1rhvupfaxenr.jpg",
      },
    },
    {
      id: "tianzi_grid_paper",
      name: "Tianzi grid paper",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764348631/yjwy3us0fy0zpr4yxjwy.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764348630/xxdbdwdjcoggoizw6anq.jpg",
      },
    },
    {
      id: "mid_paper",
      name: "Mid paper",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764348684/ucaymg7feuslc6b5qcgp.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764348686/jijckqkroi9yaardvihi.jpg",
      },
    },
    {
      id: "stationery",
      name: "Stationery",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764348758/orgwnm6gduyvc7wouas0.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764348757/xpx0gujfaswd6af8egcr.jpg",
      },
    },
  ],
  specialty: [
    {
      id: "five_line_staff",
      name: "Five-line staff",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764349959/okofmrt518jedxvncrdg.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764349957/tg3qhuifooo8ey9unnsn.jpg",
      },
    },
    {
      id: "fore_line_staff",
      name: "Fore-line staff",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764350109/dlvsv4swesgj3mpqst7l.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764350110/q6gvfs7vcvtwd1limjsz.jpg",
      },
    },
    {
      id: "six_line_staff",
      name: "Six-line staff",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764350163/jo2ae1eqqv2qcjqw2mxx.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764350161/jmj5edjhfxffnddzlc9e.jpg",
      },
    },
    {
      id: "football_plays",
      name: "Football plays",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764350221/qgimaxnuuyrgtbw7fhy9.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764350218/q4kapu0t3zjz8yncevvb.jpg",
      },
    },
    {
      id: "basketball_plays",
      name: "Basketball plays",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764350306/wxlq4cqnjnuly81foyos.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764350304/khepcopdl6myhabxrkv3.jpg",
      },
    },
    {
      id: "shuttle_plays",
      name: "Shuttle plays",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764350375/tycun2xogvecybqk7g0v.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764350373/exmzezxywy2nzmtjho4v.jpg",
      },
    },
    {
      id: "tennis_plays",
      name: "Tennis plays",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764350445/wohiwd7rvis67djd52it.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764350443/dw4fpw9qjpgttytbcnsa.jpg",
      },
    },
  ],
  life: [
    {
      id: "weekly_habits",
      name: "Weekly habits",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764346248/un0pbvu3cq1cpvpwu1yd.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764346248/tfd5p72cclghatbsvmtt.jpg",
      },
    },
    {
      id: "monthly_habits_a",
      name: "Monthly habitsA",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764346398/ksqsqa4ipzc103v6d4jp.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764346398/kyvzptl9pedhio1vgb3b.jpg",
      },
    },
    {
      id: "monthly_habits_b",
      name: "Monthly habitsB",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764346468/sdiooy66huj5j23xqh1m.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764346469/vtqdfqizdrmmkloabzwm.jpg",
      },
    },
    {
      id: "hundred_day_habits",
      name: "100-day habits",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764346530/c971sofnygnsmhv4i3qk.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764346529/ppl3m2lu1ycjfhhxzgup.jpg",
      },
    },
    {
      id: "account_book",
      name: "Account book",
      imageUrl: {
        portrait:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764346594/ikvrsulxynskzfip30vc.jpg",
        landscape:
          "https://res.cloudinary.com/dk3yac2ie/image/upload/v1764346596/qvhxccjqepaywmuv78aq.jpg",
      },
    },
  ],
};

const PAPER_SIZES = [
  { id: "A3", label: "A3" },
  { id: "A4", label: "A4" },
  { id: "A5", label: "A5" },
  { id: "B3", label: "B3" },
  { id: "B4", label: "B4" },
  { id: "B5", label: "B5" },
  { id: "Letter", label: "Letter" },
];

const ORIENTATIONS = [
  { id: "portrait", label: "Portrait", icon: "phone-rotate-portrait" },
  { id: "landscape", label: "Landscape", icon: "phone-rotate-landscape" },
];

export default function NoteSetupScreen({ navigation, route }) {
  const scrollRef = useRef(null);
  const categoryRefs = useRef({});

  const [selectedTab, setSelectedTab] = useState("cover");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDescription, setNoteDescription] = useState("");
  const [hasCover, setHasCover] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [orientation, setOrientation] = useState("portrait");
  const [paperSize, setPaperSize] = useState("A4");
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [titleModalVisible, setTitleModalVisible] = useState(false);

  const [selectedCover, setSelectedCover] = useState("label");
  const [coverColor, setCoverColor] = useState("#E3F2FD");
  const [coverImageUrl, setCoverImageUrl] = useState(null);

  // Update cover image when orientation changes
  React.useEffect(() => {
    const selectedTemplate = Object.values(COVER_TEMPLATES)
      .flat()
      .find((t) => t.id === selectedCover);

    if (selectedTemplate?.imageUrl) {
      if (
        typeof selectedTemplate.imageUrl === "object" &&
        selectedTemplate.imageUrl[orientation]
      ) {
        setCoverImageUrl(selectedTemplate.imageUrl[orientation]);
      } else if (typeof selectedTemplate.imageUrl === "string") {
        setCoverImageUrl(selectedTemplate.imageUrl);
      }
    } else {
      setCoverImageUrl(null);
    }
  }, [orientation, selectedCover]);

  const [selectedPaper, setSelectedPaper] = useState("blank");
  const [paperImageUrl, setPaperImageUrl] = useState(null);

  // Update paper image when orientation or selection changes
  React.useEffect(() => {
    const selectedTemplate = Object.values(PAPER_TEMPLATES)
      .flat()
      .find((t) => t.id === selectedPaper);

    if (selectedTemplate?.imageUrl) {
      if (
        typeof selectedTemplate.imageUrl === "object" &&
        selectedTemplate.imageUrl[orientation]
      ) {
        setPaperImageUrl(selectedTemplate.imageUrl[orientation]);
      } else if (typeof selectedTemplate.imageUrl === "string") {
        setPaperImageUrl(selectedTemplate.imageUrl);
      }
    } else {
      setPaperImageUrl(null);
    }
  }, [orientation, selectedPaper]);

  const handleCreate = async () => {
    // Validate input
    if (!noteTitle.trim()) {
      setTitleModalVisible(true);
      return;
    }

    setIsCreating(true);

    try {
      // Get the selected template to determine final imageUrl based on orientation
      const selectedTemplate = Object.values(COVER_TEMPLATES)
        .flat()
        .find((t) => t.id === selectedCover);

      let finalImageUrl = coverImageUrl;
      if (
        selectedTemplate?.imageUrl &&
        typeof selectedTemplate.imageUrl === "object"
      ) {
        // If template has orientation-based imageUrl, use the current orientation
        finalImageUrl = selectedTemplate.imageUrl[orientation] || null;
      }

      // Create project via API
      const projectData = {
        name: noteTitle.trim(),
        description: noteDescription.trim() || "",
        imageUrl: finalImageUrl || "",
      };

      // console.log("📝 Creating project with data:", projectData);
      const createdProject = await projectService.createProject(projectData);
      //("✅ Project created:", createdProject);

      // Get the project ID (backend trả về projectId)
      const projectId =
        createdProject?.projectId || createdProject?.id || createdProject?._id;

      if (!projectId) {
        throw new Error("Cannot get projectId after creation");
      }

      // Không gọi lại GET khi vừa tạo để tránh lỗi ID undefined; dùng dữ liệu trả về trực tiếp
      const projectDetails = createdProject;

      // Không tạo page ngay; để người dùng vào vẽ rồi bấm Save mới presign + tạo page
      const initialPages = [];

      // Lookup selected paper template image by orientation
      const selectedPaperTemplate = Object.values(PAPER_TEMPLATES)
        .flat()
        .find((t) => t.id === selectedPaper);

      let finalPaperImageUrl = paperImageUrl;
      if (
        selectedPaperTemplate?.imageUrl &&
        typeof selectedPaperTemplate.imageUrl === "object"
      ) {
        finalPaperImageUrl =
          selectedPaperTemplate.imageUrl[orientation] || null;
      }

      // Prepare noteConfig for DrawingScreen with complete information
      const noteConfig = {
        projectId: projectId,
        title: noteTitle || "Untitled Note",
        description: noteDescription || "",
        hasCover,
        orientation,
        paperSize,
        cover: hasCover
          ? {
            template: selectedCover,
            color: coverColor,
            imageUrl: finalImageUrl,
          }
          : null,
        paper: { template: selectedPaper, imageUrl: finalPaperImageUrl },
        pages: initialPages, // Chưa có page nào cho tới khi Save
        projectDetails: projectDetails, // Include full project details (từ response tạo project)
      };

      await offlineStorage.saveProjectLocally(`${projectId}_meta`, {
        orientation,
        paperSize,
      });

      setIsCreating(false);
      //   console.log("🚀 Navigating to DrawingScreen with config:", noteConfig);
      navigation.navigate("DrawingScreen", { noteConfig });
    } catch (error) {
      setIsCreating(false);
      // console.error("❌ Failed to create project:", error);
      Alert.alert(
        "Error",
        "Failed to create project. Please try again.\n" +
        (error.message || "Unknown error")
      );
    }
  };

  const scrollToCategory = (category) => {
    const yOffset = categoryRefs.current[category];
    if (yOffset !== undefined && scrollRef.current) {
      scrollRef.current.scrollTo({ y: yOffset, animated: true });
    }
  };

  const templates = selectedTab === "cover" ? COVER_TEMPLATES : PAPER_TEMPLATES;
  const categories = Object.keys(templates);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create note</Text>
        <TouchableOpacity onPress={handleCreate} disabled={isCreating}>
          <LinearGradient
            colors={
              isCreating ? ["#94a3b8", "#64748b"] : ["#1863dbff", "#084F8C"]
            }
            style={styles.createButton}
          >
            {isCreating ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.createButtonText}>Create</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* PHẦN TRÊN: 2 Columns */}
        <View style={styles.topSection}>
          {/* LEFT: Preview */}
          <View style={styles.leftColumn}>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  selectedTab === "cover" && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedTab("cover")}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    selectedTab === "cover" && styles.tabLabelActive,
                  ]}
                >
                  Cover
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  selectedTab === "paper" && styles.tabButtonActive,
                ]}
                onPress={() => setSelectedTab("paper")}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    selectedTab === "paper" && styles.tabLabelActive,
                  ]}
                >
                  Paper
                </Text>
              </TouchableOpacity>
            </View>

            {/* Preview Cards */}
            <View style={styles.previewContainer}>
              <View style={styles.previewCard}>
                <View
                  style={[
                    styles.previewBox,
                    orientation === "portrait"
                      ? styles.previewPortrait
                      : styles.previewLandscape,
                  ]}
                >
                  {coverImageUrl ? (
                    <Image
                      source={{ uri: coverImageUrl }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.previewBoxInner,
                        { backgroundColor: coverColor },
                      ]}
                    />
                  )}
                  <Text style={styles.previewLabel}>Cover</Text>
                </View>
              </View>
              <View style={styles.previewCard}>
                <View
                  style={[
                    styles.previewBox,
                    orientation === "portrait"
                      ? styles.previewPortrait
                      : styles.previewLandscape,
                  ]}
                >
                  {paperImageUrl ? (
                    <Image
                      source={{ uri: paperImageUrl }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.previewLines}>
                      <View style={styles.previewLine} />
                      <View style={styles.previewLine} />
                      <View style={styles.previewLine} />
                    </View>
                  )}
                  <Text style={styles.previewLabel}>Page</Text>
                </View>
              </View>
            </View>
          </View>

          {/* RIGHT: Settings */}
          <View style={styles.rightColumn}>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter note title"
              placeholderTextColor="#94a3b8"
              value={noteTitle}
              onChangeText={setNoteTitle}
            />

            <View style={styles.settingColumn}>
              <Text style={styles.settingLabel}>Description</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Enter project description (optional)"
                placeholderTextColor="#94a3b8"
                value={noteDescription}
                onChangeText={setNoteDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Cover</Text>
              <TouchableOpacity onPress={() => setHasCover(!hasCover)}>
                <View style={[styles.toggle, hasCover && styles.toggleActive]}>
                  <View
                    style={[
                      styles.toggleThumb,
                      hasCover && styles.toggleThumbActive,
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.settingColumn}>
              <Text style={styles.settingLabel}>Format</Text>
              <View style={styles.orientationTabs}>
                {ORIENTATIONS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.orientationTab,
                      orientation === item.id && styles.orientationTabActive,
                    ]}
                    onPress={() => setOrientation(item.id)}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={18}
                      color={orientation === item.id ? "#3b82f6" : "#64748b"}
                    />
                    <Text
                      style={[
                        styles.orientationTabText,
                        orientation === item.id &&
                        styles.orientationTabTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Size Buttons */}
            <View style={styles.settingColumn}>
              <Text style={styles.settingLabel}>Size</Text>
              <View style={styles.sizeButtons}>
                {PAPER_SIZES.map((size) => (
                  <TouchableOpacity
                    key={size.id}
                    style={[
                      styles.sizeButton,
                      paperSize === size.id && styles.sizeButtonActive,
                    ]}
                    onPress={() => setPaperSize(size.id)}
                  >
                    <Text
                      style={[
                        styles.sizeButtonText,
                        paperSize === size.id && styles.sizeButtonTextActive,
                      ]}
                    >
                      {size.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* PHẦN DƯỚI: Categories & Templates */}
        <View style={styles.bottomSection}>
          {/* Category Pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={styles.categoryPill}
                onPress={() => scrollToCategory(category)}
              >
                <Text style={styles.categoryPillText}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Templates by Category */}
          {categories.map((category) => (
            <View
              key={category}
              onLayout={(event) => {
                const { y } = event.nativeEvent.layout;
                categoryRefs.current[category] = y + 300; // Offset for top section
              }}
            >
              <View style={styles.categoryHeader}>
                <View style={styles.categoryLine} />
                <Text style={styles.categoryTitle}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
                <View style={styles.categoryLine} />
              </View>

              {selectedTab === "cover" ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.horizontalTemplates}
                >
                  {templates[category]?.map((template) => (
                    <TouchableOpacity
                      key={template.id}
                      style={[
                        styles.coverTemplateCard,
                        orientation === "portrait"
                          ? styles.coverCardPortrait
                          : styles.coverCardLandscape,
                        selectedCover === template.id &&
                        styles.coverTemplateCardActive,
                      ]}
                      onPress={() => {
                        setSelectedCover(template.id);
                        setCoverColor(template.color || "#F8FAFC");
                        // Get imageUrl based on orientation and template structure
                        let imageUrlValue = null;
                        if (template.imageUrl) {
                          if (
                            typeof template.imageUrl === "object" &&
                            template.imageUrl[orientation]
                          ) {
                            // If imageUrl is an object with landscape/portrait keys
                            imageUrlValue = template.imageUrl[orientation];
                          } else if (typeof template.imageUrl === "string") {
                            // If imageUrl is a simple string
                            imageUrlValue = template.imageUrl;
                          }
                        }
                        setCoverImageUrl(imageUrlValue);
                      }}
                    >
                      {(() => {
                        // Get imageUrl based on orientation
                        let imageUrlToShow = null;
                        if (template.imageUrl) {
                          if (
                            typeof template.imageUrl === "object" &&
                            template.imageUrl[orientation]
                          ) {
                            imageUrlToShow = template.imageUrl[orientation];
                          } else if (typeof template.imageUrl === "string") {
                            imageUrlToShow = template.imageUrl;
                          }
                        }

                        if (imageUrlToShow) {
                          return (
                            <LazyImage
                              source={{ uri: imageUrlToShow }}
                              style={[
                                styles.coverTemplatePreview,
                                orientation === "portrait"
                                  ? styles.coverPreviewPortrait
                                  : styles.coverPreviewLandscape,
                              ]}
                            />
                          );
                        }

                        // Fallback to gradient or solid color
                        if (template.gradient) {
                          return (
                            <LinearGradient
                              colors={template.gradient}
                              style={styles.coverTemplatePreview}
                            />
                          );
                        }

                        return (
                          <View
                            style={[
                              styles.coverTemplatePreview,
                              { backgroundColor: template.color },
                            ]}
                          >
                            {template.emoji && (
                              <Text style={styles.coverEmoji}>
                                {template.emoji}
                              </Text>
                            )}
                            {template.icon && (
                              <MaterialCommunityIcons
                                name={template.icon}
                                size={40}
                                color="#64748b"
                              />
                            )}
                          </View>
                        );
                      })()}
                      <Text style={styles.coverTemplateName} numberOfLines={2}>
                        {template.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.templatesGrid}>
                  {templates[category]?.map((template) => (
                    <TouchableOpacity
                      key={template.id}
                      style={[
                        styles.templateCard,
                        orientation === "portrait"
                          ? styles.paperCardPortrait
                          : styles.paperCardLandscape,
                        selectedPaper === template.id &&
                        styles.templateCardActive,
                      ]}
                      onPress={() => {
                        setSelectedPaper(template.id);
                        // Lấy imageUrl theo orientation nếu có
                        let img = null;
                        if (template.imageUrl) {
                          if (
                            typeof template.imageUrl === "object" &&
                            template.imageUrl[orientation]
                          ) {
                            img = template.imageUrl[orientation];
                          } else if (typeof template.imageUrl === "string") {
                            img = template.imageUrl;
                          }
                        }
                        setPaperImageUrl(img);
                      }}
                    >
                      {(() => {
                        let imageUrlToShow = null;
                        if (template.imageUrl) {
                          if (
                            typeof template.imageUrl === "object" &&
                            template.imageUrl[orientation]
                          ) {
                            imageUrlToShow = template.imageUrl[orientation];
                          } else if (typeof template.imageUrl === "string") {
                            imageUrlToShow = template.imageUrl;
                          }
                        }

                        if (imageUrlToShow) {
                          return (
                            <LazyImage
                              source={{ uri: imageUrlToShow }}
                              style={[
                                styles.paperTemplatePreview,
                                orientation === "portrait"
                                  ? styles.paperPreviewPortrait
                                  : styles.paperPreviewLandscape,
                              ]}
                            />
                          );
                        }

                        return (
                          <View
                            style={[
                              styles.paperTemplatePreview,
                              orientation === "portrait"
                                ? styles.paperPreviewPortrait
                                : styles.paperPreviewLandscape,
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={template.icon}
                              size={32}
                              color="#94a3b8"
                            />
                          </View>
                        );
                      })()}
                      <Text style={styles.templateName}>{template.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      <Modal
        visible={titleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setTitleModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              width: 300,
              maxWidth: "95%",
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 12,
              }}
            >
              Missing title
            </Text>
            <Text style={{ fontSize: 14, color: "#374151", marginBottom: 16 }}>
              Please enter a note title.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: "#3B82F6",
                }}
                onPress={() => setTitleModalVisible(false)}
              >
                <Text
                  style={{ color: "white", fontSize: 14, fontWeight: "600" }}
                >
                  OK
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0F2FE",
  },
  cancelButton: {
    fontSize: 16,
    color: "#64748b",
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Pacifico-Regular",
    color: "#084F8C",
    letterSpacing: 0.5,
  },
  createButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  content: {
    flex: 1,
  },
  topSection: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 30,
    gap: 20,
  },
  leftColumn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  rightColumn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 16,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  tabButtonActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#EFF6FF",
  },
  tabLabel: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  tabLabelActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  previewContainer: {
    flexDirection: "row",
    gap: 12,
  },
  previewCard: {
    flex: 1,
  },
  previewBox: {
    height: 180,
    borderRadius: 12,
    padding: 16,
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  previewPortrait: {
    height: 330,
  },
  previewLandscape: {
    height: 150,
  },
  previewBoxInner: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  previewImage: {
    position: "absolute",
    top: 0,
    left: 15,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  previewLines: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    gap: 8,
  },
  previewLine: {
    height: 2,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  previewLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
    marginBottom: -8,
  },
  titleInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  descriptionInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 80,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingColumn: {
    gap: 8,
  },
  settingLabel: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "500",
  },
  addButton: {
    padding: 4,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E2E8F0",
    padding: 2,
  },
  toggleActive: {
    backgroundColor: "#085497ff",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }],
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dropdownText: {
    fontSize: 15,
    color: "#0f172a",
    fontWeight: "500",
  },
  orientationTabs: {
    flexDirection: "row",
    gap: 8,
  },
  orientationTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },
  orientationTabActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3b82f6",
  },
  orientationTabText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  orientationTabTextActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  dropdownMenu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 15,
    color: "#0f172a",
  },
  sizeButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sizeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  sizeButtonActive: {
    backgroundColor: "#1366aeff",
    borderColor: "#084F8C",
  },
  sizeButtonText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  sizeButtonTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },
  bottomSection: {
    paddingHorizontal: 20,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryScrollContent: {
    gap: 12,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryPillText: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  categoryLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E2E8F0",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
  },
  templatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  templateCard: {
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  paperCardPortrait: {
    width: 140,
  },
  paperCardLandscape: {
    width: 200,
  },
  templateCardActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#EFF6FF",
  },
  templatePreview: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  paperTemplatePreview: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  paperPreviewPortrait: {
    height: 160,
  },
  paperPreviewLandscape: {
    height: 120,
  },
  templateName: {
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  // Horizontal cover templates
  horizontalTemplates: {
    paddingRight: 20,
    gap: 12,
    paddingBottom: 20,
  },
  coverTemplateCard: {
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  coverCardPortrait: {
    width: 140,
  },
  coverCardLandscape: {
    width: 200,
  },
  coverTemplateCardActive: {
    borderColor: "#3b82f6",
    backgroundColor: "#EFF6FF",
  },
  coverTemplatePreview: {
    borderRadius: 8,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  coverPreviewPortrait: {
    width: 120,
    height: 180,
  },
  coverPreviewLandscape: {
    width: 180,
    height: 120,
  },
  coverEmoji: {
    fontSize: 48,
  },
  coverTemplateName: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
    height: 32,
  },
});
