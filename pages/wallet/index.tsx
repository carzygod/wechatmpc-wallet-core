import { Link } from "@nextui-org/link";
import { Button } from "@nextui-org/button";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Divider } from "@nextui-org/divider";
import { Image } from "@nextui-org/image";
import { Chip } from "@nextui-org/chip";
import { Input } from "@nextui-org/input";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Router from "next/router";
import {Snippet} from "@nextui-org/snippet"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { deving, address_readable } from "../../core/utils/utils";
import {
  wallet_list_generate,
  wallet_mpc_try_get_kp,
  mpc,
} from "../../core/wallet/index";

import { Loading } from "@/components/loading";
import DefaultLayout from "@/layouts/default";
import Footer from "@/components/footer";

type walletCard = {
  title: string;
  full_address: string;
  address: string;
  scan: string;
  img: string;
  name: string;
  bal: string;
};

export default function DocsPage() {
  // let list : walletCard[];
  let list: walletCard[];

  list = [];
  const [data, setData] = useState([
    {
      title: "pending",
      address: "",
      full_address: "",
      scan: "",
      img: "/images/lock/2.svg",
      name: "",
      bal: "",
      tokens:[
        {
          icon: "",
          name: "",
          symbol:"",
          decimal: 8,
          address:"",
          price:0,
          bal: "",
        }
      ],
    },
  ]);

  const {
    isOpen: isSignOpen,
    onOpen: onSignOpen,
    onClose: onSignClose,
  } = useDisclosure();

  const [isMainPageLoading, setIsMainPageLoading] = useState(true);

  const [isNav, setIsNav] = useState("");

  const [preSignData, setPreSignData] = useState("");
  const [signData, setSignData] = useState("");
  const [signType, setSignType] = useState(0);

  const [coreKp,setCoreKp]=useState("");
  useEffect(() => {
    const onload = async () => {
      const mpc_kp = await wallet_mpc_try_get_kp();

      if (mpc_kp) {
        setCoreKp(mpc_kp)
        // console.log("🚧 mpc_kp :: ",mpc_kp)
        const kps = mpc.getKp(mpc_kp);
        // console.log("🚧 kps :: ",kps)
        const wallets = mpc.getAddress(mpc_kp, false);
        // console.log("🚧 wallets :: ",wallets)
        const ws = await wallet_list_generate(wallets);

        console.log("🚧 Wallets :: ", ws);
        setData(ws);
        // setData([])
        setIsMainPageLoading(false);
        setIsNav("wallet");
      }
      // console.log("🚧 hook test")
    };

    onload().catch(console.error);
  }, []);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  function CoinBar(props: any) {
    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Image
            alt="chain logo"
            height={40}
            src={props.img || ""}
            width={40}
          />
          <div className="ml-2 text-default-600">
            <p className="text-left font-semibold ">
              <span className="text-lg">{props.title}</span>
              <span className="text-small ml-1 text-default-400">
                {props.desc}
              </span>
            </p>
            <p className="text-left text-sm">
              <span>${props.value}</span>
              <span className="ml-1">{props.unit}</span>
              <span className="ml-1">{props.change}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center grow">
          <p className="text-right font-semibold w-full">{props.owns}</p>
          <p className="ml-1 text-right w-full text-default-400">
            ${props.ownsvalue}
          </p>
        </div>
      </div>
    );
  }

  function actionBtn(chainId:any)
  {
    return (
      <div className="w-full">
        <Button color="success" style={{width:"70%"}}  onPress={
          ()=>
          {
            console.log(chainId)
            // deving()
            setSignType(chainId)
            onSignOpen()
          }
        }>
          Sign New Message
        </Button>
        <Button style={{width:"30%"}} onPress={deving}>
          Share
        </Button>
      </div>
    )
  }

  return (
    <DefaultLayout name={isNav}>
      {isMainPageLoading ? <Loading /> : null}
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="text-xl"> <Chip color="success">WechatMpc</Chip> 签名管理器 </div>
        <Toaster />
        {/* <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Wallets</h1>
        </div> */}

        {data.map((item, index) => (
          <Card
            key={index}
            isPressable
            radius="lg"
            shadow="sm"
            style={{ maxWidth: "400px", width: "100%" }}
            // onPress={() => {
            //   console.log("Card details router");
            //   // Router.push({ pathname: "/wallet_details", query: JSON.stringify(item) });
            // }}
          >
            <CardHeader className="justify-between">
              <div className="flex gap-5">
                <Image
                  alt="chain logo"
                  height={40}
                  radius="sm"
                  src={item.img}
                  width={40}
                  style={{
                    color:"white"
                  }}
                />
                <div className="flex flex-col gap-1 items-start justify-center">
                  <h4 className="text-lg font-semibold leading-none text-default-600">
                    {item.name}
                  </h4>
                </div>
              </div>
              <Link isExternal href={item.scan}>
                <Chip
                  className="text-tiny text-white"
                  color="default"
                  radius="lg"
                  size="sm"
                  variant="flat"
                  onClick={
                    ()=>{
                      console.log("copy me")
                    }
                  }
                >
                  Copy
                </Chip>
              </Link>
            </CardHeader>
            <Divider className="w-[90%] m-auto" />

            <CardBody
              style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}
            >
              {
              isClient && (
                <Accordion isCompact defaultExpandedKeys={["0"]}>
                  <AccordionItem
                    key={index}
                    classNames={{
                      subtitle: "text-xs",
                    }}
                    subtitle={address_readable(12, 12, item.full_address)}
                    textValue="Wallet Details"
                  >
                    {
                      //Wallet Controller
                                      // item.tokens.map(
                                      //   (tk, tki) => (
                                      //     <div style={{padding:"10px"}}>
                                      //     <CoinBar
                                      //         change={""}
                                      //         desc={tk.name}
                                      //         img={tk.icon}
                                      //         owns={tk.bal}
                                      //         ownsvalue={tk.bal}
                                      //         title={tk.symbol}
                                      //         unit={""}
                                      //         value={tk.price}
                                      //       />
                                      //     </div>  
                                      //   )
                                      // )
                    }
                    {
                      actionBtn(0)
                    }
                    
                  </AccordionItem>
                </Accordion>
              )
              }
            </CardBody>
          </Card>
        ))}

        {/* <div style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}>
          <Button
            color="primary"
            style={{ maxWidth: "400px", width: "100%", textAlign: "center" }}
            onClick={deving}
          >
            Managment
          </Button>
        </div> */}
      </section>


      <Modal
            isOpen={isSignOpen}
            onClose={onSignClose}
            scrollBehavior={"inside"}
          >
            <ModalContent>
              <ModalHeader className="flex w-full">
                <div className="flex w-full justify-center items-center text-xl">
                  Sign New Message
                </div>
              </ModalHeader>
              <ModalBody>
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  <Input 
                  style={{width:"100%"}}
                  placeholder="Input the message to sign"
                  onChange={(e:any)=>{
                    setPreSignData(e.currentTarget.value)
                  }}
                  >
                  </Input>

                  <Button
                  color="primary"
                  onPress={
                    ()=>
                    {
                      let finalSign = ""
                      const kps = mpc.getKp(
                        coreKp
                      );
                      if(kps)
                      {
                        console.log(
                          preSignData,
                          kps,
                          preSignData
                        )
                        switch(signType)
                        {
                          case 0 : //btc
                            const btcSign = mpc.btc.sign(
                              kps,
                              preSignData
                            );
                            finalSign = btcSign ? btcSign :"";

                          break;
                          case 1 : //EVM 
                            let rawSign = mpc.evm.sign(
                              kps,
                              preSignData
                            );
                            finalSign = rawSign ? rawSign.toString() :"";
                          break;
                          case 2 : //solana
                              let solSign = mpc.sol.sign(
                              kps,
                              preSignData
                            );
                            finalSign = solSign ? solSign.toString() :"";
                          break;
                          case 3 : //Conflux
                          break;
                          default:
                            finalSign = "Sign failed"
                          break;
                        }
                      }
                      setSignData(
                        finalSign
                      )
                    }
                  }
                  >
                    Confirm
                  </Button>
                </div>

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center"
                  }}
                >
                  {
                    signData?
                    <Snippet
                    tooltipProps={{
                     // color: "foreground",
                     content: "Copy Me",
                     disableAnimation: true,
                     placement: "right",
                     closeDelay: 0,
                   }}
                   codeString={signData}
               style={{
                 width:"100%"
               }}
             >
              {
               signData.slice(0,20)+"..."
              }
             </Snippet> :
             null
                  }

                </div>
              </ModalBody>
            </ModalContent>
            <ModalFooter>
            </ModalFooter>
          </Modal>

      <Footer />
    </DefaultLayout>
  );
}
