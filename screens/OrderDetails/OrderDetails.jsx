import React, { useContext } from 'react';
import { Text, View, SafeAreaView, TouchableOpacity, Image, ScrollView} from 'react-native';
import { Button } from 'react-native-paper';
import { Provider } from 'react-native-paper';
import styles from './styles';
import TopBar from '../../components/TopBar/TopBar';
import { useRoute, useNavigation } from '@react-navigation/native';

import { DeliveryContext } from '../../contexts/DeliveryContext';
import { createCurrentOrder } from '../../services/order/orderService';
import { UserContext } from '../../contexts/UserContext';

const defualtImg = "https://e7.pngegg.com/pngimages/664/210/png-clipart-uber-eats-muncheez-delivery-online-food-ordering-food-delivery-food-logo.png";
//const defualtImg = "https://www.clipartmax.com/png/middle/475-4757771_cook-food-order-dish-restaurant-icon-cook-food-order-dish-restaurant-icon.png";

const getTotal = (order) => {
    let total = 0;
    if(order && order.meals && order.meals.length > 0){
        for (const meal of order.meals){
            total += meal.price;
        }
    }
    return total;
}

const renderDetails = (order) => {
    return(
        <View style={styles.orderDetailsContent}>
            <View style={styles.detailRow}>
                <View>
                    <Text style={styles.textDetailTitle}>Franquicia: </Text>
                </View>
                <View>
                    <Text style={styles.textDetail}>{order.name}</Text>
                </View>
            </View>
            <View style={styles.detailRow}>
                <View>
                    <Text style={styles.textDetailTitle}>Dirección: </Text>
                </View>
                <View>
                    <Text style={styles.textDetail}>{order.franchise_address}</Text>
                </View>
            </View>
            <View style={styles.detailRow}>
                <View>
                    <Text style={styles.textDetailTitle}>Pedido: </Text>
                </View>
            </View>
            <View style={styles.orderDetailRow}>
                <ScrollView style={{width: "98.5%"}} contentContainerStyle={{flexGrow: 1}}>
                    {order.meals && order.meals.length !== 0 && order.meals.map(meal => (
                        <View style={{width: '100%', marginVertical: 6}} key={meal.meal_id}>
                            <View style={{...styles.orderElements, width: '100%', display: 'flex', flexDirection: 'row', alignItems:'center'}}>
                                <View style={{flex: 2.5, flexDirection: 'row', alignItems: 'center'}}>
                                    <Image style={{width: 40, height: 40, borderRadius: 20}} source={{uri: `${meal.photo_url ? meal.photo_url : defualtImg}`}}/>
                                    <Text style={{...styles.textDetail,...styles.orderElement}}>{meal.name}</Text>
                                </View>
                                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={{...styles.textDetail,...styles.orderElement, marginLeft: "30%"}}>${meal.price}</Text>
                                </View>
                            </View>
                            <View style={{width: '100%', alginItems: 'flex-start', marginLeft: "13.5%", marginVertical: 2}}> 
                                <Text style={{color: "rgba(0,0,0,0.55)"}}>{meal.ingredients.map(ing => ing.name.toString()).join(", ")}</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>
            <View style={{...styles.detailRow, marginTop: 8}}>
                <View>
                    <Text style={{...styles.textDetailTitle, fontSize: 18}}>Total: </Text>
                </View>
                <View>
                    <Text style={{...styles.textDetailTitle, fontSize: 18}}>${getTotal(order)}</Text>
                </View>
            </View>
        </View>
    );
}

const renderButtons = (order,setDelivery) => {
    return (
        <View style={styles.buttonLayer}>
            <View style={{ flexDirection: 'column', alignSelf: 'stretch' }}>
                <Button
                    icon="check-bold"
                    mode="contained"
                    onPress={() => setDelivery()}
                    style={{ marginTop: 20, alignSelf: 'stretch' }}
                    disabled={order && order.orderStatus === "ENTREGADO"}
                    loading={false}
                    color='rgb(208, 9, 9)'
                >
                    Aceptar
                </Button>
            </View>
            <View style={{ flexDirection: 'column', alignSelf: 'stretch' }}>
                <Button
                    icon="close"
                    mode="contained"
                    onPress={() => console.log("Rechazar!!")}
                    style={{ marginTop: 20, alignSelf: 'stretch' }}
                    disabled={false}
                    loading={false}
                    color='rgba(0, 0, 0,0.16)'
                >
                    Rechazar
                </Button>
            </View>
        </View>
    );
}

const OrderDetais = () => {
    const navigation = useNavigation()
    const route = useRoute()
    const order = route.params.order;
    const {user} = useContext(UserContext);
    const {setCurrentDelivery} = useContext(DeliveryContext);

    const goBack = () => {
        navigation.goBack();
    }

    const setDelivery = async () => {
        try{
            console.log("Creating new order...");
            const reqBody = {
                "id": order.id,
                "orderStatus": "RETIRAR",
                "user": {
                    "id": user.idUser,
                    "username": user.name
                }
            }
            let res = await createCurrentOrder(reqBody);
            let newOrder = await res.json();
            console.log("New order res: ", newOrder);
            if(newOrder){
                console.log("Data: ", newOrder.data);
                setCurrentDelivery({...order,id: order.id, orderStatus: "RETIRAR"});
                goBack();
            }
            else{
                throw new Error("No se pudo crear la nueva orden actual");
            }
        }
        catch(err){
            console.log("Error al tomar la nueva orden");
            console.log(err);
        }
    }

    // Method to remove order from available orders' list

    return (
        <SafeAreaView style={{flex: 1, flexGrow:1}} >
            <Provider>
                <TopBar/>
                <View style={styles.container}>
                    <View style={styles.titleView}>
                        <TouchableOpacity style={{flex: 1}} onPress={() => goBack()}>
                            <Button color="grey" icon="chevron-left" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Detalles del {order.orderType ? order.orderType : "Pedido"}:</Text>
                    </View>
                    <View style={styles.orderDetails}>
                        { order? 
                            renderDetails(order)
                        : 
                        ( <View style={{justifyContent: 'center', alignItems: 'center', textAlign: 'center'}}>
                            <Text style={styles.noOrders}>-- Error al obtener datos del pedido --</Text>
                          </View> )
                        }
                    </View>
                    {renderButtons(order,setDelivery)}
                </View>
            </Provider>
        </SafeAreaView>
    );
}

export default OrderDetais;