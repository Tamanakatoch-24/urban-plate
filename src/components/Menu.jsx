
const dishes = [
  {
    name: "Truffle Pasta",
    category: "CHEF'S SPECIAL",
    price: "₹499",
    image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=700",
    description: "Creamy pasta with fresh herbs and truffle flavours."
  },
  {
    name: "Italian Pizza",
    category: "SIGNATURE DISH",
    price: "₹399",
    image: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=700",
    description: "Freshly baked pizza with cheese and garden toppings."
  },
  {
    name: "Chocolate Dessert",
    category: "DESSERT",
    price: "₹299",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700",
    description: "Rich chocolate dessert made for sweet moments."
  }
];

function Menu() {
  return (
    <section className="menu-section" id="menu">
      <div className="section-heading">
        <p className="eyebrow">OUR SPECIALITIES</p>
        <h2>Discover Our <span>Menu</span></h2>
        <p>Handcrafted flavours. Beautifully presented.</p>
      </div>

      <div className="menu-grid">
        {dishes.map((dish, index) => (
          <div className="menu-card" key={index}>
            <img src={dish.image} alt={dish.name} />

            <div className="menu-info">
              <p className="dish-category">{dish.category}</p>

              <div className="dish-title">
                <h3>{dish.name}</h3>
                <span>{dish.price}</span>
              </div>

              <p className="dish-description">
                {dish.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Menu;
